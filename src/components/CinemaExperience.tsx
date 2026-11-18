import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  Bookmark,
  Calendar,
  Check,
  Clapperboard,
  Download,
  Film,
  HardDrive,
  LayoutGrid,
  MoreVertical,
  PanelLeftClose,
  PanelLeftOpen,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Search,
  Share2,
  Star,
  Subtitles,
  Trash2,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Genre,
  MOVIES_CATALOG,
  MovieItem,
  MovieReview,
} from '../data/catalog';
import { ResilientImage } from './ResilientImage';

export type AppSection = 'discover' | 'catalog' | 'watchlist' | 'downloads';

interface DownloadEntry {
  movieId: string;
  qualityLabel: string;
  sizeLabel: string;
  progress: number;
  status: 'downloading' | 'ready';
  expiresInDays: number;
}

interface CinemaExperienceProps {
  section: AppSection;
  onNavigate: (section: AppSection) => void;
  onBackdropChange: (backdropUrl: string) => void;
}

const TOP_CATEGORY_TABS: Array<{ id: 'All' | Genre | 'More'; label: string }> = [
  { id: 'All', label: 'Movies' },
  { id: 'Sci-Fi', label: 'Sci-Fi' },
  { id: 'Animation', label: 'Animation' },
  { id: 'Thriller', label: 'Thriller' },
  { id: 'Drama', label: 'Drama' },
  { id: 'More', label: 'More' },
];

const ALL_GENRES: Array<'All' | Genre> = [
  'All',
  'Sci-Fi',
  'Thriller',
  'Drama',
  'Action',
  'Animation',
  'Documentary',
];

function formatTimecode(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const CinemaExperience: React.FC<CinemaExperienceProps> = ({
  section,
  onNavigate,
  onBackdropChange,
}) => {
  const [movies, setMovies] = useState<MovieItem[]>(MOVIES_CATALOG);
  const [heroIndex, setHeroIndex] = useState(0);
  const [isSideNavCollapsed, setIsSideNavCollapsed] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<'All' | Genre>('All');
  const [yearFilter2026, setYearFilter2026] = useState(false);
  const [sortBy, setSortBy] = useState<'top' | 'newest' | 'runtime'>('top');
  const [trailerSort, setTrailerSort] = useState<'today' | 'top'>('today');

  // Watchlist & Downloads
  const [watchlistIds, setWatchlistIds] = useState<string[]>(['mov_aether', 'mov_symphony']);
  const [downloads, setDownloads] = useState<DownloadEntry[]>([
    {
      movieId: 'mov_solaris',
      qualityLabel: '1080p HDR',
      sizeLabel: '2.2 GB',
      progress: 100,
      status: 'ready',
      expiresInDays: 29,
    },
  ]);

  // Modals
  const [detailMovieId, setDetailMovieId] = useState<string | null>(null);
  const [playerState, setPlayerState] = useState<{
    movie: MovieItem;
    mode: 'stream' | 'trailer';
  } | null>(null);
  const [shareMovie, setShareMovie] = useState<MovieItem | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Player controls
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [captionsOn, setCaptionsOn] = useState(true);
  const [streamQuality, setStreamQuality] = useState<'4K Dolby Vision' | '1080p Full HD' | '720p HD'>('4K Dolby Vision');
  const [playbackSec, setPlaybackSec] = useState(18);

  // Review composer
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => setToastMessage(msg);

  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 2800);
    return () => clearTimeout(t);
  }, [toastMessage]);

  useEffect(() => {
    const hasActive = downloads.some((d) => d.status === 'downloading');
    if (!hasActive) return;
    const timer = setInterval(() => {
      setDownloads((prev) =>
        prev.map((d) => {
          if (d.status !== 'downloading') return d;
          const next = Math.min(100, d.progress + 20);
          return {
            ...d,
            progress: next,
            status: next >= 100 ? 'ready' : 'downloading',
          };
        })
      );
    }, 550);
    return () => clearInterval(timer);
  }, [downloads]);

  useEffect(() => {
    if (!playerState || !isPlaying) return;
    const maxSec =
      playerState.mode === 'trailer'
        ? playerState.movie.trailerDurationSec
        : playerState.movie.runtimeMinutes * 60;
    const interval = setInterval(() => {
      setPlaybackSec((s) => (s + 1 >= maxSec ? 0 : s + 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [playerState, isPlaying]);

  const detailMovie = useMemo(
    () => movies.find((m) => m.id === detailMovieId) || null,
    [movies, detailMovieId]
  );

  const featuredPool = useMemo(() => movies.filter((m) => m.featured), [movies]);

  const heroMovie = useMemo(
    () => featuredPool[heroIndex % featuredPool.length] || movies[0],
    [featuredPool, heroIndex, movies]
  );

  useEffect(() => {
    if (heroMovie?.backdropUrl) {
      onBackdropChange(heroMovie.backdropUrl);
    }
  }, [heroMovie, onBackdropChange]);

  const filteredMovies = useMemo(() => {
    const list = movies.filter((m) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        m.title.toLowerCase().includes(q) ||
        m.director.toLowerCase().includes(q) ||
        m.cast.some((c) => c.toLowerCase().includes(q));
      const matchesGenre = selectedGenre === 'All' || m.genres.includes(selectedGenre);
      const matchesYear = !yearFilter2026 || m.year === 2026;
      return matchesSearch && matchesGenre && matchesYear;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'newest') return b.year - a.year || b.score - a.score;
      if (sortBy === 'runtime') return a.runtimeMinutes - b.runtimeMinutes;
      return b.score - a.score;
    });
  }, [movies, searchQuery, selectedGenre, yearFilter2026, sortBy]);

  const youMightLike = useMemo(() => {
    const base = filteredMovies.filter((m) => m.id !== heroMovie.id);
    return (base.length >= 4 ? base : filteredMovies).slice(0, 4);
  }, [filteredMovies, heroMovie.id]);

  const newTrailers = useMemo(() => {
    const sorted = [...movies].sort((a, b) =>
      trailerSort === 'today' ? b.year - a.year : b.score - a.score
    );
    return sorted.slice(0, 3);
  }, [movies, trailerSort]);

  const continueWatching = useMemo(
    () => movies.filter((m) => typeof m.continueProgress === 'number'),
    [movies]
  );

  const watchlistMovies = useMemo(
    () => movies.filter((m) => watchlistIds.includes(m.id)),
    [movies, watchlistIds]
  );

  const toggleWatchlist = (movie: MovieItem) => {
    const exists = watchlistIds.includes(movie.id);
    setWatchlistIds((prev) =>
      exists ? prev.filter((id) => id !== movie.id) : [...prev, movie.id]
    );
    showToast(exists ? `Removed "${movie.title}" from Watchlist` : `Saved "${movie.title}" to Watchlist`);
  };

  const handleStartPlayback = (movie: MovieItem, mode: 'stream' | 'trailer') => {
    setStreamQuality('4K Dolby Vision');
    setPlaybackSec(mode === 'trailer' ? 0 : Math.round((movie.continueProgress || 0) * 12));
    setIsPlaying(true);
    setPlayerState({ movie, mode });
  };

  const handleStartDownload = (movie: MovieItem, quality: 'uhd4k' | 'hd1080' | 'sd720') => {
    const qualityLabel =
      quality === 'uhd4k' ? '4K Dolby Vision' : quality === 'hd1080' ? '1080p HDR' : '720p HD';
    const sizeLabel = movie.downloadSizes[quality];
    setDownloads((prev) => {
      const filtered = prev.filter((d) => d.movieId !== movie.id);
      return [
        {
          movieId: movie.id,
          qualityLabel,
          sizeLabel,
          progress: 20,
          status: 'downloading',
          expiresInDays: 30,
        },
        ...filtered,
      ];
    });
    showToast(`Downloading "${movie.title}" (${qualityLabel})`);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailMovie || !reviewComment.trim()) return;
    const newReview: MovieReview = {
      id: `rev_${Date.now()}`,
      author: 'Viewer',
      rating: reviewRating,
      date: '2026-11-16',
      comment: reviewComment.trim(),
    };
    setMovies((prev) =>
      prev.map((m) =>
        m.id === detailMovie.id ? { ...m, reviews: [newReview, ...m.reviews] } : m
      )
    );
    setReviewComment('');
    showToast('Review added.');
  };

  return (
    <div className="w-full flex flex-col lg:flex-row items-stretch gap-5">
      {/* 1. LEFT FLOATING VERTICAL GLASS DOCK (Collapsible) */}
      <AnimatePresence initial={false}>
        {!isSideNavCollapsed && (
          <motion.aside
            key="primary-side-nav"
            aria-label="Primary rail navigation"
            initial={{ opacity: 0, width: 0, scale: 0.92, marginRight: -20 }}
            animate={{ opacity: 1, width: 'auto', scale: 1, marginRight: 0 }}
            exit={{ opacity: 0, width: 0, scale: 0.92, marginRight: -20 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:flex flex-col items-center gap-3 self-center cx-spatial-shell rounded-full p-2.5 shrink-0 overflow-hidden"
          >
            <motion.button
              type="button"
              onClick={() => setIsSideNavCollapsed(true)}
              title="Collapse side navigation"
              aria-label="Collapse side navigation"
              aria-expanded={true}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              className="w-10 h-10 rounded-full cx-crystal-1 text-slate-200 hover:text-white hover:bg-white/20 flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white shrink-0"
            >
              <PanelLeftClose className="w-4 h-4" aria-hidden="true" />
            </motion.button>

            <div className="w-6 h-px bg-white/15 shrink-0" aria-hidden="true" />

            {(
              [
                {
                  id: 'discover',
                  label: 'Discover',
                  icon: LayoutGrid,
                  active: section === 'discover' && !yearFilter2026,
                  onClick: () => {
                    setYearFilter2026(false);
                    onNavigate('discover');
                  },
                },
                {
                  id: 'catalog',
                  label: 'Movies Catalog',
                  icon: Film,
                  active: section === 'catalog' && !yearFilter2026,
                  onClick: () => {
                    setYearFilter2026(false);
                    onNavigate('catalog');
                  },
                },
                {
                  id: 'premieres',
                  label: '2026 Releases',
                  icon: Calendar,
                  active: section === 'catalog' && yearFilter2026,
                  onClick: () => {
                    setYearFilter2026(true);
                    onNavigate('catalog');
                  },
                },
                {
                  id: 'watchlist',
                  label: 'Watchlist',
                  icon: Bookmark,
                  active: section === 'watchlist',
                  onClick: () => {
                    setYearFilter2026(false);
                    onNavigate('watchlist');
                  },
                },
                {
                  id: 'downloads',
                  label: 'Offline Downloads',
                  icon: Download,
                  active: section === 'downloads',
                  onClick: () => {
                    setYearFilter2026(false);
                    onNavigate('downloads');
                  },
                },
              ] as const
            ).map((item) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.id}
                  type="button"
                  onClick={item.onClick}
                  title={item.label}
                  aria-label={item.label}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.94 }}
                  className={`relative w-12 h-12 rounded-full flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white shrink-0 ${
                    item.active ? 'text-white' : 'cx-crystal-1 text-slate-200 hover:bg-white/20'
                  }`}
                >
                  {item.active && (
                    <motion.span
                      layoutId="dock-active-glow"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      className="absolute inset-0 rounded-full cx-glow-cta"
                    />
                  )}
                  <Icon className="relative z-10 w-5 h-5" aria-hidden="true" />
                </motion.button>
              );
            })}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* 2. CENTER MAIN SPATIAL CRYSTAL PANEL */}
      <section className="flex-1 min-w-0 cx-spatial-shell rounded-[32px] p-4 sm:p-6 flex flex-col gap-5">
        {/* Top Bar inside Main Glass Panel: Expand Nav + Brand + Frosted Category Pill Dock */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <AnimatePresence initial={false}>
              {isSideNavCollapsed && (
                <motion.button
                  key="expand-side-nav"
                  type="button"
                  initial={{ opacity: 0, width: 0, scale: 0.8 }}
                  animate={{ opacity: 1, width: 38, scale: 1 }}
                  exit={{ opacity: 0, width: 0, scale: 0.8 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => setIsSideNavCollapsed(false)}
                  title="Expand side navigation"
                  aria-label="Expand side navigation"
                  aria-expanded={false}
                  className="hidden lg:flex h-[38px] rounded-full cx-crystal-2 hover:bg-white/25 text-white items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white shrink-0 overflow-hidden"
                >
                  <PanelLeftOpen className="w-4 h-4 shrink-0" aria-hidden="true" />
                </motion.button>
              )}
            </AnimatePresence>

            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setSelectedGenre('All');
                setYearFilter2026(false);
                onNavigate('discover');
              }}
              className="flex items-center gap-2.5 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D48] rounded-xl px-1"
            >
              <div className="w-9 h-9 rounded-xl cx-glow-cta flex items-center justify-center shrink-0">
                <Clapperboard className="w-4 h-4 text-white" aria-hidden="true" />
              </div>
              <span className="font-display text-lg font-extrabold tracking-tight text-white whitespace-nowrap">
                CINEONEX
              </span>
            </motion.button>
          </div>

          {/* Segmented Category Tabs with Spring-Gliding Active Pill */}
          <nav
            aria-label="Category filter"
            className="cx-crystal-1 rounded-full p-1 flex items-center gap-1 overflow-x-auto cx-scroll-x max-w-full"
          >
            {TOP_CATEGORY_TABS.map((tab) => {
              const active =
                tab.id === 'More'
                  ? section === 'catalog'
                  : section === 'discover' && selectedGenre === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    if (tab.id === 'More') {
                      setYearFilter2026(false);
                      onNavigate('catalog');
                    } else {
                      setSelectedGenre(tab.id);
                      setYearFilter2026(false);
                      onNavigate('discover');
                    }
                  }}
                  className={`relative min-h-[38px] px-4 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active ? 'text-white' : 'text-slate-200/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="top-cat-pill"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      className="absolute inset-0 rounded-full cx-glow-cta"
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </header>

        {/* DISCOVER VIEW */}
        {section === 'discover' && (
          <>
            {/* Hero Spotlight Card with Smooth Crossfade & Ken Burns Motion */}
            <div className="relative rounded-[26px] overflow-hidden border border-white/25 shadow-2xl h-[340px] sm:h-[390px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={heroMovie.id}
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0"
                >
                  <ResilientImage
                    src={heroMovie.backdropUrl}
                    alt={`${heroMovie.title} cinema still`}
                    fallbackTitle={heroMovie.title}
                    className="w-full h-full object-cover cx-ken-burns"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080514]/95 via-[#080514]/40 to-black/20" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#080514]/85 via-[#080514]/35 to-transparent" />
                </motion.div>
              </AnimatePresence>

              {/* Top-left New Trending Tag */}
              <div className="relative z-10 pt-4 pl-4 sm:pt-5 sm:pl-6">
                <span className="cx-crystal-1 rounded-full px-3.5 py-1.5 text-xs font-medium text-white inline-block">
                  New Trending
                </span>
              </div>

              {/* Bottom Hero Info + Controls */}
              <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-7 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={heroMovie.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-lg space-y-2.5"
                  >
                    <div className="flex items-center gap-2 text-xs text-slate-200 font-medium tabular-nums">
                      <span>{heroMovie.genres.join(' · ')}</span>
                      <span aria-hidden="true">·</span>
                      <span>{heroMovie.year}</span>
                      <span aria-hidden="true">·</span>
                      <span>{heroMovie.runtimeMinutes}m</span>
                    </div>

                    <h1 className="font-display text-2xl sm:text-4xl font-bold text-white tracking-tight text-balance">
                      {heroMovie.title}
                    </h1>

                    <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed line-clamp-2">
                      {heroMovie.synopsis}
                    </p>

                    <div className="flex flex-wrap items-center gap-2.5 pt-1.5">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleStartPlayback(heroMovie, 'stream')}
                        className="min-h-[42px] pl-3.5 pr-5 py-2 rounded-full cx-glow-cta text-white text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <span className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center">
                          <Play className="w-3 h-3 fill-current" aria-hidden="true" />
                        </span>
                        <span>Watch</span>
                      </motion.button>

                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleStartDownload(heroMovie, 'hd1080')}
                        className="min-h-[42px] px-4 py-2 rounded-full cx-crystal-2 hover:bg-white/25 text-white text-xs sm:text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <Download className="w-4 h-4" aria-hidden="true" />
                        <span>Download</span>
                      </motion.button>

                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.94 }}
                        onClick={() => setDetailMovieId(heroMovie.id)}
                        aria-label={`Details for ${heroMovie.title}`}
                        className="w-[42px] h-[42px] rounded-full cx-crystal-2 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                      >
                        <MoreVertical className="w-4 h-4" aria-hidden="true" />
                      </motion.button>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Prev / Next Spotlight Arrows */}
                <div className="flex items-center gap-2 self-end">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() =>
                      setHeroIndex((i) => (i - 1 + featuredPool.length) % featuredPool.length)
                    }
                    aria-label="Previous featured movie"
                    className="w-10 h-10 rounded-full cx-crystal-2 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setHeroIndex((i) => (i + 1) % featuredPool.length)}
                    aria-label="Next featured movie"
                    className="w-10 h-10 rounded-full cx-crystal-2 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Kinetic Cinema Reel Text Marquee (pauses on hover, click any title for details) */}
            <div className="cx-crystal-1 rounded-full py-2 px-3 overflow-hidden cx-marquee-group cx-marquee-fade">
              <div className="cx-marquee-track items-center">
                {[0, 1].map((dup) => (
                  <div key={dup} aria-hidden={dup === 1} className="flex items-center gap-6 pr-6 shrink-0">
                    {movies.map((m) => (
                      <button
                        key={`${m.id}-${dup}`}
                        type="button"
                        tabIndex={dup === 1 ? -1 : undefined}
                        onClick={() => setDetailMovieId(m.id)}
                        className="flex items-center gap-3 text-xs text-slate-200 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <span className="font-display font-semibold text-white">{m.title}</span>
                        <span className="text-slate-300/80">
                          {m.genres[0]} · {m.videoFormats[0]} · {m.score.toFixed(1)}
                        </span>
                        <span aria-hidden="true" className="text-white/30">
                          /
                        </span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* "You might like" Frosted Sub-Panel */}
            <div className="cx-crystal-1 rounded-[24px] p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-display text-base sm:text-lg font-semibold text-white">
                  You might like
                </h2>
                <button
                  type="button"
                  onClick={() => onNavigate('catalog')}
                  className="text-xs font-medium text-slate-200 hover:text-white transition-colors cursor-pointer"
                >
                  See All
                </button>
              </div>

              {youMightLike.length === 0 ? (
                <div className="py-8 text-center space-y-3">
                  <p className="text-sm text-slate-200">No titles match your search.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedGenre('All');
                    }}
                    className="px-4 py-2 rounded-full cx-crystal-2 text-xs font-medium text-white cursor-pointer"
                  >
                    Reset Search
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {youMightLike.map((movie, idx) => (
                    <motion.div
                      key={movie.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.35,
                        delay: idx * 0.06,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      whileHover={{ y: -5, scale: 1.015 }}
                      className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/20 cursor-pointer"
                      onClick={() => setDetailMovieId(movie.id)}
                    >
                      <ResilientImage
                        src={movie.posterUrl}
                        alt={movie.title}
                        fallbackTitle={movie.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.07]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#080514]/95 via-[#080514]/35 to-transparent" />

                      <div className="absolute inset-x-0 bottom-0 p-3.5 flex items-end justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-[11px] font-medium text-slate-200/85">
                            {movie.genres[0]}
                          </div>
                          <h3 className="font-display text-sm font-bold text-white truncate">
                            {movie.title}
                          </h3>
                          <p className="text-[11px] text-slate-300/90 line-clamp-1 mt-0.5">
                            {movie.tagline}
                          </p>
                        </div>

                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.12 }}
                          whileTap={{ scale: 0.92 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartPlayback(movie, 'stream');
                          }}
                          aria-label={`Play ${movie.title}`}
                          className="w-9 h-9 rounded-full cx-crystal-2 hover:bg-white/30 text-white flex items-center justify-center shrink-0 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Reverse-Direction Visual Poster Marquee Strip */}
              <div className="pt-2 overflow-hidden cx-marquee-group cx-marquee-fade">
                <div className="cx-marquee-track-reverse items-center">
                  {[0, 1].map((dup) => (
                    <div key={dup} aria-hidden={dup === 1} className="flex items-center gap-3 pr-3 shrink-0">
                      {movies.map((movie) => (
                        <button
                          key={`reel-${movie.id}-${dup}`}
                          type="button"
                          tabIndex={dup === 1 ? -1 : undefined}
                          onClick={() => handleStartPlayback(movie, 'trailer')}
                          className="group relative w-44 h-20 rounded-xl overflow-hidden border border-white/15 shrink-0 text-left cursor-pointer"
                        >
                          <ResilientImage
                            src={movie.backdropUrl}
                            alt={movie.title}
                            fallbackTitle={movie.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#080514]/90 via-[#080514]/30 to-transparent" />
                          <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <div className="text-[11px] font-semibold text-white truncate">
                                {movie.title}
                              </div>
                              <div className="text-[10px] text-slate-300 truncate">
                                Trailer · {movie.runtimeMinutes}m
                              </div>
                            </div>
                            <Play className="w-3 h-3 text-white fill-current shrink-0 opacity-85" aria-hidden="true" />
                          </div>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* MOVIES CATALOG VIEW */}
        {section === 'catalog' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="font-display text-2xl font-bold text-white">
                  {yearFilter2026 ? '2026 Premieres' : 'Movies Library'}
                </h1>
                <p className="text-xs text-slate-200/80 mt-0.5 tabular-nums">
                  {filteredMovies.length} {filteredMovies.length === 1 ? 'film' : 'films'} available
                </p>
              </div>

              <div className="flex items-center gap-2">
                {(
                  [
                    { id: 'top', label: 'Top Rated' },
                    { id: 'newest', label: 'Newest' },
                    { id: 'runtime', label: 'Shortest' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSortBy(opt.id)}
                    className={`min-h-[36px] px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                      sortBy === opt.id
                        ? 'cx-glow-cta text-white'
                        : 'cx-crystal-1 text-slate-200 hover:bg-white/20'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto cx-scroll-x pb-1">
              {ALL_GENRES.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => setSelectedGenre(genre)}
                  className={`min-h-[36px] px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer ${
                    selectedGenre === genre
                      ? 'cx-crystal-2 text-white border-white/40'
                      : 'cx-crystal-1 text-slate-300 hover:text-white'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>

            {filteredMovies.length === 0 ? (
              <div className="cx-crystal-1 rounded-2xl p-10 text-center space-y-3">
                <p className="text-sm text-white font-medium">No matching films found.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedGenre('All');
                    setYearFilter2026(false);
                  }}
                  className="px-4 py-2 rounded-full cx-crystal-2 text-xs font-semibold text-white cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredMovies.map((movie) => {
                  const inWatchlist = watchlistIds.includes(movie.id);
                  return (
                    <div
                      key={movie.id}
                      className="cx-crystal-1 rounded-2xl overflow-hidden flex flex-col group"
                    >
                      <div
                        className="relative aspect-[16/10] overflow-hidden cursor-pointer"
                        onClick={() => setDetailMovieId(movie.id)}
                      >
                        <ResilientImage
                          src={movie.backdropUrl}
                          alt={movie.title}
                          fallbackTitle={movie.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#080514]/90 via-transparent to-transparent" />
                        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-slate-100 tabular-nums">
                          <span>{movie.rating}</span>
                          <span>{movie.score.toFixed(1)}</span>
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                        <div>
                          <button
                            type="button"
                            onClick={() => setDetailMovieId(movie.id)}
                            className="font-display font-bold text-sm text-white hover:text-[#FB7185] text-left cursor-pointer"
                          >
                            {movie.title}
                          </button>
                          <p className="text-xs text-slate-300 mt-0.5 tabular-nums">
                            {movie.year} · {movie.genres.join(' · ')}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-white/15">
                          <button
                            type="button"
                            onClick={() => handleStartPlayback(movie, 'stream')}
                            className="px-3.5 py-1.5 rounded-full cx-glow-cta text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                          >
                            <Play className="w-3 h-3 fill-current" aria-hidden="true" />
                            <span>Watch</span>
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => toggleWatchlist(movie)}
                              aria-label={`Toggle watchlist for ${movie.title}`}
                              className="w-8 h-8 rounded-full cx-crystal-1 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
                            >
                              {inWatchlist ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                              ) : (
                                <Bookmark className="w-3.5 h-3.5" aria-hidden="true" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStartDownload(movie, 'hd1080')}
                              aria-label={`Download ${movie.title}`}
                              className="w-8 h-8 rounded-full cx-crystal-1 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5 text-sky-300" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* WATCHLIST VIEW */}
        {section === 'watchlist' && (
          <div className="space-y-5">
            <div className="flex items-baseline justify-between">
              <div>
                <h1 className="font-display text-2xl font-bold text-white">Your Watchlist</h1>
                <p className="text-xs text-slate-300 mt-0.5">
                  Films saved to stream anytime.
                </p>
              </div>
              <span className="text-xs text-slate-200 tabular-nums">
                {watchlistMovies.length} saved
              </span>
            </div>

            {watchlistMovies.length === 0 ? (
              <div className="cx-crystal-1 rounded-2xl p-10 text-center space-y-3">
                <p className="text-sm text-white font-medium">Your watchlist is empty.</p>
                <button
                  type="button"
                  onClick={() => onNavigate('discover')}
                  className="px-5 py-2 rounded-full cx-glow-cta text-xs font-semibold text-white cursor-pointer"
                >
                  Explore Movies
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {watchlistMovies.map((movie) => (
                  <div key={movie.id} className="cx-crystal-1 rounded-2xl p-3.5 flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setDetailMovieId(movie.id)}
                      className="w-24 h-20 rounded-xl overflow-hidden shrink-0 cursor-pointer"
                    >
                      <ResilientImage
                        src={movie.backdropUrl}
                        alt={movie.title}
                        fallbackTitle={movie.title}
                        className="w-full h-full object-cover"
                      />
                    </button>
                    <div className="flex-1 min-w-0 space-y-1">
                      <button
                        type="button"
                        onClick={() => setDetailMovieId(movie.id)}
                        className="font-display font-bold text-sm text-white hover:text-[#FB7185] truncate block cursor-pointer"
                      >
                        {movie.title}
                      </button>
                      <p className="text-xs text-slate-300 tabular-nums">
                        {movie.year} · {movie.runtimeMinutes}m · {movie.genres[0]}
                      </p>
                      <div className="flex items-center gap-2 pt-1.5">
                        <button
                          type="button"
                          onClick={() => handleStartPlayback(movie, 'stream')}
                          className="px-3.5 py-1.5 rounded-full cx-glow-cta text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-current" aria-hidden="true" />
                          <span>Watch</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleWatchlist(movie)}
                          className="px-3 py-1.5 rounded-full cx-crystal-1 hover:bg-white/20 text-slate-200 text-xs cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* DOWNLOADS VIEW */}
        {section === 'downloads' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl font-bold text-white">Offline Downloads</h1>
                <p className="text-xs text-slate-300 mt-0.5">
                  Saved films ready for offline viewing.
                </p>
              </div>
              <div className="cx-crystal-1 rounded-full px-3.5 py-1.5 flex items-center gap-2 text-xs text-slate-200 tabular-nums">
                <HardDrive className="w-3.5 h-3.5 text-sky-300" aria-hidden="true" />
                <span>{downloads.length} saved</span>
              </div>
            </div>

            {downloads.length === 0 ? (
              <div className="cx-crystal-1 rounded-2xl p-10 text-center space-y-3">
                <p className="text-sm text-white font-medium">No offline downloads yet.</p>
                <button
                  type="button"
                  onClick={() => onNavigate('discover')}
                  className="px-5 py-2 rounded-full cx-glow-cta text-xs font-semibold text-white cursor-pointer"
                >
                  Find Movies to Download
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {downloads.map((entry) => {
                  const movie = movies.find((m) => m.id === entry.movieId);
                  if (!movie) return null;
                  return (
                    <div
                      key={entry.movieId}
                      className="cx-crystal-1 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-20 h-14 rounded-xl overflow-hidden shrink-0">
                          <ResilientImage
                            src={movie.backdropUrl}
                            alt={movie.title}
                            fallbackTitle={movie.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <h2 className="font-display font-bold text-sm text-white truncate">
                            {movie.title}
                          </h2>
                          <p className="text-xs text-slate-300 tabular-nums mt-0.5">
                            {entry.qualityLabel} · {entry.sizeLabel} ·{' '}
                            {entry.status === 'ready'
                              ? `${entry.expiresInDays}d offline`
                              : `Downloading (${entry.progress}%)`}
                          </p>
                          {entry.status === 'downloading' && (
                            <div className="mt-1.5 h-1.5 w-40 bg-white/15 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-sky-400 transition-all"
                                style={{ width: `${entry.progress}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={entry.status !== 'ready'}
                          onClick={() => handleStartPlayback(movie, 'stream')}
                          className="px-4 py-1.5 rounded-full cx-crystal-2 hover:bg-white/25 disabled:opacity-40 text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-current" aria-hidden="true" />
                          <span>Play</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDownloads((prev) => prev.filter((d) => d.movieId !== entry.movieId));
                            showToast(`Removed "${movie.title}" from downloads.`);
                          }}
                          aria-label={`Delete ${movie.title} download`}
                          className="w-9 h-9 rounded-full cx-crystal-1 hover:bg-rose-500/30 text-slate-200 flex items-center justify-center cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>

      {/* 3. RIGHT FLOATING VERTICAL GLASS SIDEBAR */}
      <aside
        aria-label="Trailers and continue watching"
        className="w-full lg:w-[320px] xl:w-[340px] shrink-0 cx-spatial-shell rounded-[32px] p-4 sm:p-5 flex flex-col gap-5"
      >
        {/* Top Search & Quick Access Bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              className="w-4 h-4 text-slate-200 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              aria-label="Search movies"
              className="w-full h-10 pl-10 pr-3 rounded-full cx-crystal-1 text-xs text-white placeholder:text-slate-300/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D48]"
            />
          </div>

          <button
            type="button"
            onClick={() => onNavigate('watchlist')}
            aria-label={`Open watchlist (${watchlistIds.length})`}
            title="Watchlist"
            className="w-10 h-10 rounded-full cx-crystal-1 hover:bg-white/20 text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer"
          >
            <Bookmark className="w-4 h-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate('downloads')}
            aria-label={`Open downloads (${downloads.length})`}
            title="Downloads"
            className="w-10 h-10 rounded-full cx-crystal-1 hover:bg-white/20 text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* New Trailer Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold text-white">New Trailer</h2>
            <button
              type="button"
              onClick={() => setTrailerSort((s) => (s === 'today' ? 'top' : 'today'))}
              className="text-[11px] text-slate-200 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <span>Sort by {trailerSort === 'today' ? 'Today' : 'Top'}</span>
              <ArrowUpDown className="w-3 h-3" aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-3">
            {newTrailers.map((movie) => (
              <button
                key={movie.id}
                type="button"
                onClick={() => handleStartPlayback(movie, 'trailer')}
                className="group relative w-full h-28 rounded-2xl overflow-hidden border border-white/20 text-left block cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D48]"
              >
                <ResilientImage
                  src={movie.backdropUrl}
                  alt={`${movie.title} trailer`}
                  fallbackTitle={movie.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080514]/90 via-black/20 to-transparent" />
                <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-display text-xs font-bold text-white truncate">
                      {movie.title}
                    </div>
                    <div className="text-[11px] text-slate-300 truncate">
                      {movie.genres.join(' · ')}
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full cx-crystal-2 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                    <Play className="w-3.5 h-3.5 text-white fill-current" aria-hidden="true" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Continue Watching Section */}
        <div className="space-y-3 pt-1">
          <h2 className="font-display text-sm font-semibold text-white">Continue Watching</h2>

          <div className="space-y-2.5">
            {continueWatching.map((movie) => (
              <button
                key={movie.id}
                type="button"
                onClick={() => handleStartPlayback(movie, 'stream')}
                className="w-full cx-crystal-1 hover:bg-white/15 rounded-2xl p-2.5 flex items-center gap-3 text-left transition-colors cursor-pointer group"
              >
                <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0">
                  <ResilientImage
                    src={movie.posterUrl}
                    alt={movie.title}
                    fallbackTitle={movie.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white truncate">{movie.title}</div>
                  <div className="text-[11px] text-slate-300 tabular-nums mt-0.5">
                    {movie.continueProgress}% · {movie.runtimeMinutes}m
                  </div>
                  <div className="mt-1.5 h-1 w-full bg-white/15 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#FB7185]"
                      style={{ width: `${movie.continueProgress}%` }}
                    />
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full cx-crystal-2 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                  <Play className="w-3.5 h-3.5 text-white fill-current" aria-hidden="true" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* MOVIE DETAIL MODAL */}
      <AnimatePresence>
        {detailMovie && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-label={`${detailMovie.title} details`}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: 'spring', stiffness: 360, damping: 30 }}
              className="cx-crystal-3 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
            <div className="relative h-64 sm:h-72 overflow-hidden">
              <ResilientImage
                src={detailMovie.backdropUrl}
                alt={detailMovie.title}
                fallbackTitle={detailMovie.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#120D24] via-[#120D24]/35 to-transparent" />
              <button
                type="button"
                onClick={() => setDetailMovieId(null)}
                aria-label="Close movie details"
                className="absolute top-4 right-4 w-11 h-11 rounded-full cx-crystal-2 text-white flex items-center justify-center hover:bg-white/25 cursor-pointer"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
              <div className="absolute bottom-5 left-6 right-6">
                <p className="text-xs text-sky-300 font-medium mb-1">
                  {detailMovie.videoFormats.join(' · ')}
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                  {detailMovie.title}
                </h2>
                <p className="text-xs text-slate-200 tabular-nums mt-1">
                  {detailMovie.year} · {detailMovie.runtimeMinutes} min · Rated {detailMovie.rating} · Score {detailMovie.score.toFixed(1)}
                </p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleStartPlayback(detailMovie, 'stream')}
                  className="min-h-[44px] px-5 py-2.5 rounded-full cx-glow-cta text-white text-sm font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                  <span>Watch Now</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleStartPlayback(detailMovie, 'trailer')}
                  className="min-h-[44px] px-4 py-2.5 rounded-full cx-crystal-1 hover:bg-white/20 text-white text-sm font-medium flex items-center gap-2 cursor-pointer"
                >
                  <Film className="w-4 h-4" aria-hidden="true" />
                  <span>Play Trailer</span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleWatchlist(detailMovie)}
                  className="min-h-[44px] px-4 py-2.5 rounded-full cx-crystal-1 hover:bg-white/20 text-white text-sm font-medium flex items-center gap-2 cursor-pointer"
                >
                  <Bookmark className="w-4 h-4" aria-hidden="true" />
                  <span>{watchlistIds.includes(detailMovie.id) ? 'Saved' : 'Watchlist'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShareMovie(detailMovie);
                    setCopiedLink(false);
                  }}
                  className="min-h-[44px] px-4 py-2.5 rounded-full cx-crystal-1 hover:bg-white/20 text-white text-sm font-medium flex items-center gap-2 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" aria-hidden="true" />
                  <span>Share</span>
                </button>
              </div>

              <p className="text-sm text-slate-100 leading-relaxed">{detailMovie.synopsis}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/10 text-xs">
                <div>
                  <span className="text-slate-300/75 block mb-1">Director & Cast</span>
                  <p className="text-white font-medium">{detailMovie.director}</p>
                  <p className="text-slate-200 mt-0.5">{detailMovie.cast.join(', ')}</p>
                </div>
                <div>
                  <span className="text-slate-300/75 block mb-1">Audio & Picture</span>
                  <p className="text-white font-medium">{detailMovie.videoFormats.join(' · ')}</p>
                  <p className="text-slate-200 mt-0.5">{detailMovie.audioFormats.join(' · ')}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-2.5">
                <div className="text-xs font-semibold text-white">Download for Offline Viewing</div>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { key: 'uhd4k', label: '4K Dolby Vision', size: detailMovie.downloadSizes.uhd4k },
                      { key: 'hd1080', label: '1080p HDR', size: detailMovie.downloadSizes.hd1080 },
                      { key: 'sd720', label: '720p HD', size: detailMovie.downloadSizes.sd720 },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => handleStartDownload(detailMovie, opt.key)}
                      className="min-h-[40px] px-3.5 py-2 rounded-full cx-crystal-1 hover:bg-white/20 text-xs text-white flex items-center gap-2 transition-colors cursor-pointer tabular-nums"
                    >
                      <Download className="w-3.5 h-3.5 text-sky-300" aria-hidden="true" />
                      <span>
                        {opt.label} ({opt.size})
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-4">
                <div className="text-sm font-semibold text-white">
                  Viewer Reviews ({detailMovie.reviews.length})
                </div>

                <form onSubmit={handleSubmitReview} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-300">Rate this film:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        aria-label={`Rate ${star} stars`}
                        className="p-1 cursor-pointer"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            star <= reviewRating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                          }`}
                          aria-hidden="true"
                        />
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your thoughts on this film..."
                      className="flex-1 min-h-[42px] px-4 py-2 rounded-full cx-crystal-1 text-xs text-white placeholder:text-slate-300/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D48]"
                    />
                    <button
                      type="submit"
                      className="min-h-[42px] px-5 py-2 rounded-full cx-crystal-2 hover:bg-white/25 text-xs font-semibold text-white cursor-pointer"
                    >
                      Post
                    </button>
                  </div>
                </form>

                <div className="space-y-3">
                  {detailMovie.reviews.map((rev) => (
                    <div key={rev.id} className="py-2.5 border-b border-white/10 last:border-0">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium text-white">{rev.author}</span>
                        <span className="text-slate-300 tabular-nums">
                          {rev.rating}/5 · {rev.date}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CINEMA VIDEO PLAYER MODAL */}
      <AnimatePresence>
        {playerState && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
            role="dialog"
            aria-modal="true"
            aria-label={`Playing ${playerState.movie.title}`}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="w-full max-w-5xl rounded-3xl overflow-hidden border border-white/20 bg-black shadow-2xl"
            >
            <div className="relative aspect-video bg-black">
              <ResilientImage
                src={playerState.movie.backdropUrl}
                alt={playerState.movie.title}
                fallbackTitle={playerState.movie.title}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  isPlaying ? 'opacity-95' : 'opacity-55'
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/65" />

              <div className="absolute top-0 left-0 right-0 p-5 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-sky-300 font-medium">
                    {playerState.mode === 'trailer' ? 'Official Trailer' : streamQuality}
                  </div>
                  <h3 className="font-display text-lg font-bold text-white mt-0.5">
                    {playerState.movie.title}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setPlayerState(null)}
                  aria-label="Close player"
                  className="w-11 h-11 rounded-full cx-crystal-2 text-white flex items-center justify-center hover:bg-white/25 cursor-pointer"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              {captionsOn && (
                <div className="absolute bottom-28 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-xl bg-black/75 backdrop-blur-md text-sm text-white text-center max-w-lg">
                  {playerState.movie.tagline}
                </div>
              )}

              <div className="absolute bottom-4 left-4 right-4 cx-crystal-2 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-200 tabular-nums w-12">
                    {formatTimecode(playbackSec)}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={
                      playerState.mode === 'trailer'
                        ? playerState.movie.trailerDurationSec
                        : playerState.movie.runtimeMinutes * 60
                    }
                    value={playbackSec}
                    onChange={(e) => setPlaybackSec(Number(e.target.value))}
                    aria-label="Seek timeline"
                    className="flex-1 accent-[#DB2777] cursor-pointer"
                  />
                  <span className="text-xs font-mono text-slate-300 tabular-nums w-12 text-right">
                    {formatTimecode(
                      playerState.mode === 'trailer'
                        ? playerState.movie.trailerDurationSec
                        : playerState.movie.runtimeMinutes * 60
                    )}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsPlaying((p) => !p)}
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                      className="min-h-[40px] px-4 py-2 rounded-full cx-glow-cta text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4 fill-current" aria-hidden="true" />
                      ) : (
                        <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                      )}
                      <span>{isPlaying ? 'Pause' : 'Play'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlaybackSec((s) => Math.max(0, s - 10))}
                      aria-label="Rewind 10 seconds"
                      className="w-10 h-10 rounded-full cx-crystal-1 text-white flex items-center justify-center hover:bg-white/20 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlaybackSec((s) => s + 10)}
                      aria-label="Skip forward 10 seconds"
                      className="w-10 h-10 rounded-full cx-crystal-1 text-white flex items-center justify-center hover:bg-white/20 cursor-pointer"
                    >
                      <RotateCw className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsMuted((m) => !m)}
                      aria-label={isMuted ? 'Unmute' : 'Mute'}
                      className="w-10 h-10 rounded-full cx-crystal-1 text-white flex items-center justify-center hover:bg-white/20 cursor-pointer"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCaptionsOn((c) => !c)}
                      className={`min-h-[40px] px-3.5 rounded-full text-xs font-medium flex items-center gap-1.5 cursor-pointer ${
                        captionsOn ? 'bg-white/25 text-white' : 'cx-crystal-1 text-slate-300'
                      }`}
                    >
                      <Subtitles className="w-4 h-4" aria-hidden="true" />
                      <span>Subtitles</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {(['4K Dolby Vision', '1080p Full HD', '720p HD'] as const).map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setStreamQuality(q)}
                        className={`min-h-[36px] px-3 rounded-full text-xs font-medium cursor-pointer ${
                          streamQuality === q
                            ? 'bg-sky-400/25 text-sky-200 border border-sky-300/40'
                            : 'cx-crystal-1 text-slate-200 hover:bg-white/15'
                        }`}
                      >
                        {q.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* SHARE MODAL */}
      <AnimatePresence>
        {shareMovie && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-label="Share movie"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              className="cx-crystal-3 rounded-3xl max-w-md w-full p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-white">Share {shareMovie.title}</h3>
                <button
                  type="button"
                  onClick={() => setShareMovie(null)}
                  aria-label="Close share dialog"
                  className="w-9 h-9 rounded-full hover:bg-white/15 text-slate-200 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-200">
                Send this link to friends so they can jump straight into {shareMovie.title} on CINEONEX.
              </p>
              <div className="p-3 rounded-xl cx-crystal-1 font-mono text-xs text-slate-100 truncate">
                https://cineonex.io/watch/{shareMovie.id}
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(`https://cineonex.io/watch/${shareMovie.id}`);
                  setCopiedLink(true);
                  showToast('Link copied to clipboard.');
                }}
                className="w-full min-h-[44px] rounded-full cx-glow-cta text-white text-xs font-semibold cursor-pointer"
              >
                {copiedLink ? 'Link Copied' : 'Copy Link'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            role="status"
            aria-live="polite"
            className="fixed bottom-20 lg:bottom-6 right-6 z-50 cx-crystal-3 rounded-full px-5 py-3 text-xs font-medium text-white shadow-xl"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
