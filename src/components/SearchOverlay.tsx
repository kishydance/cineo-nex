import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bookmark,
  Check,
  Film,
  Play,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Genre, MovieItem } from '../data/catalog';
import { ResilientImage } from './ResilientImage';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  movies: MovieItem[];
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  watchlistIds: string[];
  onToggleWatchlist: (movie: MovieItem) => void;
  onPlayMovie: (movie: MovieItem, mode: 'stream' | 'trailer') => void;
  onSelectMovie: (movie: MovieItem) => void;
}

const GENRE_FILTERS: Array<'All' | Genre> = [
  'All',
  'Sci-Fi',
  'Thriller',
  'Drama',
  'Action',
  'Animation',
  'Documentary',
];

const FORMAT_FILTERS = ['All', 'Dolby Vision', 'HDR10+', 'IMAX Enhanced'] as const;
type FormatFilter = (typeof FORMAT_FILTERS)[number];

type YearFilter = 'all' | '2026' | '2025';
type SortOption = 'top' | 'newest' | 'runtime';

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  isOpen,
  onClose,
  movies,
  searchQuery,
  onSearchQueryChange,
  watchlistIds,
  onToggleWatchlist,
  onPlayMovie,
  onSelectMovie,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedGenre, setSelectedGenre] = useState<'All' | Genre>('All');
  const [yearFilter, setYearFilter] = useState<YearFilter>('all');
  const [formatFilter, setFormatFilter] = useState<FormatFilter>('All');
  const [sortBy, setSortBy] = useState<SortOption>('top');
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    const focusTimer = setTimeout(() => {
      inputRef.current?.focus();
    }, 60);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    selectedGenre !== 'All' ||
    yearFilter !== 'all' ||
    formatFilter !== 'All' ||
    sortBy !== 'top';

  const resetAll = () => {
    onSearchQueryChange('');
    setSelectedGenre('All');
    setYearFilter('all');
    setFormatFilter('All');
    setSortBy('top');
  };

  const filteredMovies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const matches = movies.filter((movie) => {
      const matchesQuery =
        !q ||
        movie.title.toLowerCase().includes(q) ||
        movie.tagline.toLowerCase().includes(q) ||
        movie.synopsis.toLowerCase().includes(q) ||
        movie.director.toLowerCase().includes(q) ||
        movie.cast.some((actor) => actor.toLowerCase().includes(q)) ||
        movie.genres.some((g) => g.toLowerCase().includes(q)) ||
        movie.videoFormats.some((fmt) => fmt.toLowerCase().includes(q)) ||
        movie.audioFormats.some((aud) => aud.toLowerCase().includes(q));

      const matchesGenre = selectedGenre === 'All' || movie.genres.includes(selectedGenre);
      const matchesYear = yearFilter === 'all' || String(movie.year) === yearFilter;
      const matchesFormat =
        formatFilter === 'All' ||
        movie.videoFormats.some((fmt) => fmt.toLowerCase().includes(formatFilter.toLowerCase()));

      return matchesQuery && matchesGenre && matchesYear && matchesFormat;
    });

    return [...matches].sort((a, b) => {
      if (sortBy === 'newest') return b.year - a.year || b.score - a.score;
      if (sortBy === 'runtime') return a.runtimeMinutes - b.runtimeMinutes;
      return b.score - a.score;
    });
  }, [movies, searchQuery, selectedGenre, yearFilter, formatFilter, sortBy]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="glass-search-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 pt-6 sm:pt-12 bg-[#060414]/65 backdrop-blur-xl overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Search movie catalog"
        >
          <motion.div
            initial={{ opacity: 0, y: -18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -14, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl cx-spatial-shell rounded-[30px] p-4 sm:p-6 flex flex-col gap-4 max-h-[86vh] shadow-2xl"
          >
            {/* Top Glassmorphic Search Input Row */}
            <div className="flex items-center gap-2.5">
              <div className="relative flex-1">
                <Search
                  className="w-4.5 h-4.5 text-rose-300 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  ref={inputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => onSearchQueryChange(e.target.value)}
                  placeholder="Search films, directors, cast, genres, or 4K formats..."
                  aria-label="Filter catalog by title, cast, director, or genre"
                  className="w-full h-12 pl-11 pr-24 rounded-full cx-crystal-2 text-sm text-white placeholder:text-slate-300/75 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D48]"
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        onSearchQueryChange('');
                        inputRef.current?.focus();
                      }}
                      aria-label="Clear search query"
                      className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  )}
                  <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-medium text-slate-200 tabular-nums">
                    {filteredMovies.length}/{movies.length}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowFilters((s) => !s)}
                aria-expanded={showFilters}
                aria-label="Toggle catalog filters"
                title="Filters"
                className={`h-12 px-3.5 rounded-full flex items-center gap-2 text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                  showFilters
                    ? 'cx-crystal-2 text-white border-white/35'
                    : 'cx-crystal-1 text-slate-200 hover:bg-white/20'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">Filters</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close search overlay"
                className="w-12 h-12 rounded-full cx-crystal-1 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4.5 h-4.5" aria-hidden="true" />
              </button>
            </div>

            {/* Interactive Filter Controls */}
            <AnimatePresence initial={false}>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="cx-crystal-1 rounded-2xl p-3.5 space-y-3">
                    {/* Genre Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto cx-scroll-x pb-0.5">
                      {GENRE_FILTERS.map((genre) => {
                        const active = selectedGenre === genre;
                        return (
                          <button
                            key={genre}
                            type="button"
                            onClick={() => setSelectedGenre(genre)}
                            className={`relative min-h-[34px] px-3.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                              active
                                ? 'text-white'
                                : 'text-slate-200/90 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            {active && (
                              <motion.span
                                layoutId="search-overlay-genre-pill"
                                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                                className="absolute inset-0 rounded-full cx-glow-cta"
                              />
                            )}
                            <span className="relative z-10">{genre}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Year, Video Format & Sort Chips */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {(
                          [
                            { id: 'all', label: 'All Years' },
                            { id: '2026', label: '2026' },
                            { id: '2025', label: '2025' },
                          ] as const
                        ).map((yr) => (
                          <button
                            key={yr.id}
                            type="button"
                            onClick={() => setYearFilter(yr.id)}
                            className={`px-3 py-1 rounded-full text-[11px] font-medium cursor-pointer transition-colors ${
                              yearFilter === yr.id
                                ? 'bg-white/25 text-white border border-white/30'
                                : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-transparent'
                            }`}
                          >
                            {yr.label}
                          </button>
                        ))}

                        <span className="w-px h-4 bg-white/15 mx-0.5" aria-hidden="true" />

                        {FORMAT_FILTERS.map((fmt) => (
                          <button
                            key={fmt}
                            type="button"
                            onClick={() => setFormatFilter(fmt)}
                            className={`px-3 py-1 rounded-full text-[11px] font-medium cursor-pointer transition-colors ${
                              formatFilter === fmt
                                ? 'bg-sky-400/25 text-sky-200 border border-sky-300/40'
                                : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-transparent'
                            }`}
                          >
                            {fmt === 'All' ? 'Any Format' : fmt}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-1.5">
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
                            className={`px-2.5 py-1 rounded-full text-[11px] font-medium cursor-pointer transition-colors ${
                              sortBy === opt.id
                                ? 'bg-rose-500/25 text-rose-200 border border-rose-400/40'
                                : 'text-slate-300 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}

                        {hasActiveFilters && (
                          <button
                            type="button"
                            onClick={resetAll}
                            className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-[11px] font-medium text-white flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" aria-hidden="true" />
                            <span>Reset</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Interactive Filtered Catalog Grid */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-3 min-h-[220px]">
              <div className="flex items-center justify-between text-xs text-slate-300 px-1">
                <span className="flex items-center gap-1.5 font-medium text-slate-200">
                  <Sparkles className="w-3.5 h-3.5 text-rose-400" aria-hidden="true" />
                  {hasActiveFilters
                    ? `Showing ${filteredMovies.length} matching ${
                        filteredMovies.length === 1 ? 'film' : 'films'
                      }`
                    : `Full Cinema Catalog (${filteredMovies.length} films)`}
                </span>
                <span className="hidden sm:inline text-[11px] text-slate-300/75">
                  Press Esc to return
                </span>
              </div>

              {filteredMovies.length === 0 ? (
                <div className="cx-crystal-1 rounded-2xl p-10 text-center space-y-3">
                  <p className="text-sm font-medium text-white">
                    No films match {searchQuery ? `"${searchQuery}"` : 'these filters'}.
                  </p>
                  <p className="text-xs text-slate-300">
                    Try another title, director, actor, or reset your active filters.
                  </p>
                  <button
                    type="button"
                    onClick={resetAll}
                    className="px-5 py-2 rounded-full cx-glow-cta text-xs font-semibold text-white cursor-pointer"
                  >
                    Clear Search & Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pb-1">
                  {filteredMovies.map((movie) => {
                    const inWatchlist = watchlistIds.includes(movie.id);
                    return (
                      <motion.div
                        key={movie.id}
                        layout
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.22 }}
                        className="group cx-crystal-1 hover:bg-white/15 rounded-2xl overflow-hidden flex flex-col transition-colors"
                      >
                        <div
                          onClick={() => {
                            onClose();
                            onSelectMovie(movie);
                          }}
                          className="relative aspect-[16/10] overflow-hidden cursor-pointer"
                        >
                          <ResilientImage
                            src={movie.backdropUrl}
                            alt={movie.title}
                            fallbackTitle={movie.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#080514]/95 via-[#080514]/25 to-transparent" />
                          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
                            <span className="px-2 py-0.5 rounded-full bg-black/55 backdrop-blur-md border border-white/15 text-[10px] font-medium text-white">
                              {movie.genres[0]}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-black/55 backdrop-blur-md border border-white/15 text-[10px] font-semibold text-amber-300 flex items-center gap-1 tabular-nums">
                              <Star className="w-2.5 h-2.5 fill-current" aria-hidden="true" />
                              {movie.score.toFixed(1)}
                            </span>
                          </div>
                          <div className="absolute bottom-2.5 left-3 right-3">
                            <h3 className="font-display text-sm font-bold text-white truncate group-hover:text-rose-300 transition-colors">
                              {movie.title}
                            </h3>
                            <p className="text-[11px] text-slate-300 truncate tabular-nums">
                              {movie.year} · {movie.runtimeMinutes}m · {movie.director}
                            </p>
                          </div>
                        </div>

                        <div className="p-3 flex-1 flex flex-col justify-between gap-2.5">
                          <p className="text-[11px] text-slate-200/85 line-clamp-2 leading-relaxed">
                            {movie.tagline}
                          </p>

                          <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-white/10">
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  onClose();
                                  onPlayMovie(movie, 'stream');
                                }}
                                className="px-3 py-1.5 rounded-full cx-glow-cta text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                              >
                                <Play className="w-3 h-3 fill-current" aria-hidden="true" />
                                <span>Watch</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  onClose();
                                  onPlayMovie(movie, 'trailer');
                                }}
                                aria-label={`Play trailer for ${movie.title}`}
                                className="px-2.5 py-1.5 rounded-full cx-crystal-1 hover:bg-white/20 text-slate-100 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                              >
                                <Film className="w-3 h-3" aria-hidden="true" />
                                <span>Trailer</span>
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => onToggleWatchlist(movie)}
                              aria-label={
                                inWatchlist
                                  ? `Remove ${movie.title} from watchlist`
                                  : `Save ${movie.title} to watchlist`
                              }
                              className="w-8 h-8 rounded-full cx-crystal-1 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer shrink-0"
                            >
                              {inWatchlist ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                              ) : (
                                <Bookmark className="w-3.5 h-3.5" aria-hidden="true" />
                              )}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
