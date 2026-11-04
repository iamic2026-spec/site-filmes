'use client';

import React, { useState } from 'react';
import { Star, Edit3, Trash2, Heart, MessageSquare, Film, Sparkles } from 'lucide-react';
import { Movie } from '@/lib/types';

interface MovieCardProps {
  movie: Movie;
  isOwner: boolean;
  onEdit?: (movie: Movie) => void;
  onDelete?: (movieId: string) => void;
  onLike?: (movieId: string) => void;
  onCommentOnMovie?: (movieTitle: string) => void;
  onClickMovie?: (movie: Movie) => void;
}

export function MovieCard({
  movie,
  isOwner,
  onEdit,
  onDelete,
  onLike,
  onCommentOnMovie,
  onClickMovie,
}: MovieCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDeleting) {
      onDelete?.(movie.id);
    } else {
      setIsDeleting(true);
      setTimeout(() => setIsDeleting(false), 4000); // Reset confirm state after 4s
    }
  };

  return (
    <div
      onClick={() => onClickMovie?.(movie)}
      className="group relative flex flex-col cursor-pointer rounded-2xl border border-white/8 bg-[#12121A] transition-all duration-300 hover:scale-[1.02] hover:border-[#F43F5E] hover:shadow-[0_16px_36px_-8px_rgba(0,0,0,0.9),0_0_24px_rgba(244,63,94,0.3)] overflow-hidden"
    >
      {/* Poster Aspect Ratio 2:3 */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900">
        {!imageError && movie.posterUrl ? (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          /* Sleek Resilient Fallback Poster */
          <div className="h-full w-full flex flex-col justify-between p-6 bg-gradient-to-br from-[#1E1E2A] via-[#12121A] to-[#0A0A0E] border-b border-white/5">
            <div className="flex items-center justify-between">
              <div className="h-8 w-8 rounded-lg bg-[#F43F5E]/20 flex items-center justify-center text-[#F43F5E]">
                <Film className="h-4 w-4" />
              </div>
              <span className="font-meta text-[11px] uppercase tracking-wider text-slate-400">
                {movie.genre}
              </span>
            </div>
            <div className="space-y-1">
              <h4 className="font-display text-lg font-bold text-white line-clamp-3">
                {movie.title}
              </h4>
              <p className="text-xs text-slate-400">{movie.director} · {movie.year}</p>
            </div>
          </div>
        )}

        {/* Ambient Top Gradient Scrim */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          {/* Rating Badge (Cinema Gold) */}
          <div className="flex items-center gap-1.5 rounded-lg border border-[#F59E0B]/30 bg-[#0A0A0E]/80 backdrop-blur-md px-2.5 py-1 text-xs font-bold text-[#FBBF24] shadow-sm">
            <Star className="h-3.5 w-3.5 fill-[#FBBF24]" />
            <span className="tabular-nums font-mono">{Number(movie.rating).toFixed(1)}</span>
          </div>

          {/* Year */}
          <span className="rounded-md bg-black/60 backdrop-blur-md px-2 py-0.5 font-meta text-[11px] text-slate-300 font-medium">
            {movie.year}
          </span>
        </div>

        {/* Bottom Fade Gradient Scrim */}
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#12121A] via-[#12121A]/80 to-transparent pointer-events-none" />

        {/* Floating Quick Action Overlay on Hover */}
        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {isOwner ? (
            <div className="flex items-center gap-2 w-full justify-end">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(movie);
                }}
                className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-black/75 px-3 py-1.5 text-xs font-medium text-white hover:border-[#F43F5E] hover:text-[#F43F5E] backdrop-blur-md transition-colors"
                title="Editar filme"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Editar</span>
              </button>

              <button
                type="button"
                onClick={handleDeleteClick}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium backdrop-blur-md transition-all ${
                  isDeleting
                    ? 'bg-red-600 text-white font-bold animate-pulse'
                    : 'border border-white/20 bg-black/75 text-red-400 hover:bg-red-600/30 hover:border-red-500'
                }`}
                title={isDeleting ? 'Clique novamente para confirmar' : 'Remover dos favoritos'}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{isDeleting ? 'Confirmar?' : 'Remover'}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 w-full justify-between">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onLike?.(movie.id);
                }}
                className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-black/75 px-2.5 py-1.5 text-xs font-medium text-white hover:border-[#F43F5E] hover:text-[#F43F5E] backdrop-blur-md transition-colors"
              >
                <Heart className="h-3.5 w-3.5 text-[#F43F5E]" />
                <span className="tabular-nums font-mono">{movie.likesCount || 0}</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCommentOnMovie?.(movie.title);
                }}
                className="flex items-center gap-1.5 rounded-lg border border-[#38BDF8]/40 bg-black/75 px-3 py-1.5 text-xs font-medium text-[#38BDF8] hover:bg-[#38BDF8]/20 backdrop-blur-md transition-colors"
                title="Comentar sobre este filme no mural"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Comentar</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Card Information Body */}
      <div className="flex flex-1 flex-col p-4 sm:p-5 justify-between">
        <div className="space-y-2">
          {/* Clean unboxed metadata with typographic separators (§1.A anti-slop) */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="text-[#38BDF8] font-medium">{movie.genre}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="truncate max-w-[120px]">{movie.director}</span>
          </div>

          {/* Title */}
          <h3 className="font-display text-base font-bold text-white group-hover:text-[#F43F5E] transition-colors line-clamp-1">
            {movie.title}
          </h3>

          {/* Cinephile's Personal Quote / Frase */}
          {movie.userReview && (
            <div className="relative rounded-lg bg-white/5 p-3 border border-white/5">
              <p className="text-xs italic text-slate-300 line-clamp-3 leading-relaxed">
                &ldquo;{movie.userReview}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Tech Badges & Duration */}
        <div className="mt-4 pt-3 border-t border-white/8 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            {movie.techSpecs && movie.techSpecs.length > 0 ? (
              <span className="font-meta uppercase tracking-wider text-[#38BDF8] font-semibold text-[10px]">
                {movie.techSpecs[0]}
              </span>
            ) : (
              <span className="font-meta uppercase tracking-wider text-slate-500 text-[10px]">
                HD
              </span>
            )}
            {movie.duration && (
              <>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="tabular-nums font-mono">{movie.duration}</span>
              </>
            )}
          </div>

          {movie.tags && movie.tags.length > 0 && (
            <span className="text-[10px] text-slate-400 truncate max-w-[100px]">
              {movie.tags[0]}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
