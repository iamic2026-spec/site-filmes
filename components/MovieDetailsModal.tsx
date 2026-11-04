'use client';

import React, { useState } from 'react';
import { X, Star, Heart, Film, MessageSquare, Send, Sparkles } from 'lucide-react';
import { Movie, User, ProfileComment } from '@/lib/types';

interface MovieDetailsModalProps {
  movie: Movie | null;
  ownerUser: User;
  currentUser: User;
  comments: ProfileComment[];
  onClose: () => void;
  onLikeMovie: (movieId: string) => void;
  onAddComment: (profileUserId: string, content: string, movieMention?: string) => void;
}

export function MovieDetailsModal({
  movie,
  ownerUser,
  currentUser,
  comments,
  onClose,
  onLikeMovie,
  onAddComment,
}: MovieDetailsModalProps) {
  const [commentText, setCommentText] = useState('');

  if (!movie) return null;

  const movieComments = comments.filter((c) => c.movieMention === movie.title);

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(ownerUser.id, commentText, movie.title);
    setCommentText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl border border-white/10 bg-[#12121A] shadow-[0_24px_64px_-12px_rgba(0,0,0,0.95),0_0_32px_0_rgba(244,63,94,0.25)] overflow-hidden my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 rounded-full bg-black/60 backdrop-blur-md p-2 text-white hover:bg-black/90 transition-colors"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Hero Backdrop Banner */}
        <div className="relative h-56 sm:h-72 w-full overflow-hidden bg-slate-900">
          <img
            src={movie.backdropUrl || movie.posterUrl}
            alt={movie.title}
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#12121A] via-[#12121A]/60 to-black/30" />
        </div>

        {/* Content Body */}
        <div className="relative px-6 sm:px-8 pb-8 -mt-24 sm:-mt-28">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Poster 2:3 */}
            <div className="relative aspect-[2/3] w-36 sm:w-44 shrink-0 rounded-2xl overflow-hidden border-2 border-white/20 bg-slate-800 shadow-[0_12px_32px_rgba(0,0,0,0.9)]">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Title & Technical Metadata */}
            <div className="flex-1 space-y-3 pt-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-meta text-xs uppercase tracking-wider text-[#38BDF8] font-bold">
                  {movie.genre}
                </span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-xs text-slate-300">{movie.year}</span>
                {movie.duration && (
                  <>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="text-xs text-slate-300 font-mono tabular-nums">{movie.duration}</span>
                  </>
                )}
              </div>

              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                {movie.title}
              </h2>

              <p className="text-xs text-slate-400">
                Direção: <span className="text-white font-medium">{movie.director}</span>
              </p>

              {/* Rating and Like Button */}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex items-center gap-1.5 rounded-lg border border-[#F59E0B]/30 bg-[#F59E0B]/10 px-3 py-1.5 text-sm font-bold text-[#FBBF24]">
                  <Star className="h-4 w-4 fill-[#FBBF24]" />
                  <span className="font-mono tabular-nums">{Number(movie.rating).toFixed(1)} / 10</span>
                </div>

                <button
                  type="button"
                  onClick={() => onLikeMovie(movie.id)}
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:border-[#F43F5E] hover:text-[#F43F5E] transition-colors"
                >
                  <Heart className="h-4 w-4 text-[#F43F5E]" />
                  <span>Curtir ({movie.likesCount || 0})</span>
                </button>
              </div>

              {/* Tech Specs */}
              {movie.techSpecs && movie.techSpecs.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {movie.techSpecs.map((spec, i) => (
                    <span
                      key={i}
                      className="font-meta text-[10px] font-bold uppercase tracking-wider text-[#38BDF8] bg-[#10172A] border border-[#38BDF8]/20 rounded px-2 py-0.5"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cinephile's review quote box */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#FBBF24] mb-1.5">
              <Sparkles className="h-4 w-4" />
              <span>Por que está nos favoritos de {ownerUser.name}?</span>
            </div>
            <p className="text-sm italic text-slate-200 leading-relaxed">
              &ldquo;{movie.userReview}&rdquo;
            </p>
          </div>

          {/* Dedicated comments on this specific movie */}
          <div className="mt-8 border-t border-white/10 pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[#F43F5E]" />
                <h4 className="font-display text-sm font-bold text-white">
                  O que os visitantes acham deste filme ({movieComments.length})
                </h4>
              </div>
            </div>

            {/* Quick Comment Form */}
            <form onSubmit={handleSendComment} className="flex gap-2">
              <input
                type="text"
                required
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={`Deixe uma palavra sobre ${movie.title}...`}
                className="flex-1 rounded-xl border border-white/10 bg-black/60 px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-[#F43F5E] focus:outline-none"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="neon-btn-primary flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Enviar</span>
              </button>
            </form>

            {/* Comments Stream */}
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
              {movieComments.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">
                  Nenhum visitante comentou sobre este filme ainda. Seja o primeiro!
                </p>
              ) : (
                movieComments.map((comm) => (
                  <div
                    key={comm.id}
                    className="rounded-xl border border-white/5 bg-white/3 p-3 flex items-start gap-3"
                  >
                    <img
                      src={comm.authorAvatar}
                      alt={comm.authorName}
                      className="h-8 w-8 rounded-full object-cover shrink-0 border border-white/15"
                      referrerPolicy="no-referrer"
                    />
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-semibold text-white">{comm.authorName}</span>
                        <span className="text-[10px] text-slate-500">{comm.createdAt}</span>
                      </div>
                      <p className="text-xs text-slate-300">&ldquo;{comm.content}&rdquo;</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
