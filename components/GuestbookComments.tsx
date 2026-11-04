'use client';

import React, { useState } from 'react';
import { MessageSquare, Heart, Send, Trash2, Film, Sparkles, User as UserIcon } from 'lucide-react';
import { User, Movie, ProfileComment } from '@/lib/types';

interface GuestbookCommentsProps {
  viewingUser: User;
  currentUser: User;
  comments: ProfileComment[];
  userMovies: Movie[];
  onAddComment: (profileUserId: string, content: string, movieMention?: string) => void;
  onToggleLike: (commentId: string) => void;
  onDeleteComment: (commentId: string) => void;
  onVisitProfile?: (userId: string) => void;
}

const QUICK_REACTIONS = [
  'Seleção impecável!',
  'Temos o mesmo gosto!',
  'Essa lista é uma obra-prima!',
  'Interestelar merece nota 10!',
  'Blade Runner é insuperável!',
  'Gosto cinematográfico refinado!',
  'Adicionei aos meus para assistir!',
];

export function GuestbookComments({
  viewingUser,
  currentUser,
  comments,
  userMovies,
  onAddComment,
  onToggleLike,
  onDeleteComment,
  onVisitProfile,
}: GuestbookCommentsProps) {
  const [commentText, setCommentText] = useState('');
  const [selectedMovie, setSelectedMovie] = useState('');
  const isViewingSelf = currentUser.id === viewingUser.id;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    onAddComment(viewingUser.id, commentText, selectedMovie || undefined);
    setCommentText('');
    setSelectedMovie('');
  };

  const handleQuickReaction = (reaction: string) => {
    setCommentText((prev) => (prev ? `${prev} ${reaction}` : reaction));
  };

  return (
    <div className="space-y-6">
      {/* Header & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/8 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F43F5E]/20 text-[#F43F5E]">
              <MessageSquare className="h-4 w-4" />
            </div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-white">
              {isViewingSelf
                ? 'Mural de Visitas dos Seus Filmes'
                : `Deixe um Recado para ${viewingUser.name}`}
            </h3>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            {isViewingSelf
              ? 'Veja o que outros cinéfilos visitantes disseram sobre sua seleção de filmes favoritos.'
              : `Compartilhe uma palavra, frase ou reação sobre os filmes favoritos de ${viewingUser.name}.`}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-slate-400 bg-white/5 rounded-lg px-3 py-1.5 border border-white/5">
          <span className="text-[#FBBF24] font-bold font-mono">{comments.length}</span>
          <span>{comments.length === 1 ? 'comentário' : 'comentários'} no mural</span>
        </div>
      </div>

      {/* Comment Input Box Form */}
      <div className="rounded-2xl border border-white/10 bg-[#12121A] p-4 sm:p-6 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.8)]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9 overflow-hidden rounded-full border border-white/20 bg-slate-800 shrink-0">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <UserIcon className="h-full w-full p-2 text-slate-400" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white">
                Comentando como: <span className="text-[#F43F5E]">{currentUser.name}</span>
              </span>
              <span className="text-[11px] text-slate-400">
                {currentUser.isGuest ? 'Visitante' : `@${currentUser.username}`}
              </span>
            </div>
          </div>

          {/* Quick Reaction Pills (§1.A filter/action buttons) */}
          <div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-[#FBBF24]" />
              <span>Ideias rápidas de frases para deixar:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_REACTIONS.map((reaction, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleQuickReaction(reaction)}
                  className="rounded-lg border border-white/8 bg-white/5 px-2.5 py-1 text-xs text-slate-300 hover:border-[#F43F5E]/50 hover:bg-[#F43F5E]/10 hover:text-white transition-colors"
                >
                  {reaction}
                </button>
              ))}
            </div>
          </div>

          {/* Text Area */}
          <div className="relative">
            <textarea
              required
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={`Escreva sua palavra ou frase sobre os filmes favoritos de ${viewingUser.name}...`}
              className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-[#F43F5E] focus:outline-none focus:ring-1 focus:ring-[#F43F5E] resize-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            {/* Optional Movie Mention Dropdown */}
            {userMovies.length > 0 && (
              <div className="flex items-center gap-2">
                <Film className="h-4 w-4 text-[#38BDF8] shrink-0" />
                <select
                  value={selectedMovie}
                  onChange={(e) => setSelectedMovie(e.target.value)}
                  className="rounded-lg border border-white/10 bg-black/60 px-3 py-1.5 text-xs text-slate-300 focus:border-[#F43F5E] focus:outline-none w-full sm:w-auto"
                >
                  <option value="">Comentário Geral sobre a Lista</option>
                  {userMovies.map((m) => (
                    <option key={m.id} value={m.title} className="bg-[#12121A] text-white">
                      Sobre: {m.title} ({m.year})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="neon-btn-primary flex items-center justify-center gap-2 rounded-xl py-2 px-5 text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-md shrink-0"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Publicar no Mural</span>
            </button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-3.5">
        {comments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/2 p-8 text-center">
            <MessageSquare className="h-8 w-8 text-slate-500 mx-auto mb-2 opacity-50" />
            <h4 className="font-display text-sm font-semibold text-slate-300">
              Nenhuma mensagem ainda
            </h4>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              Seja o primeiro cinéfilo visitante a deixar uma palavra sobre estes filmes favoritos!
            </p>
          </div>
        ) : (
          comments.map((comment) => {
            const canDelete =
              currentUser.id === comment.authorId || currentUser.id === viewingUser.id;

            return (
              <div
                key={comment.id}
                className="group relative rounded-xl border border-white/8 bg-[#12121A] p-4 sm:p-5 transition-all hover:border-white/15 hover:bg-[#161622]"
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Author avatar & info */}
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => onVisitProfile?.(comment.authorId)}
                      className="relative h-10 w-10 overflow-hidden rounded-full border border-white/15 bg-slate-800 shrink-0 hover:border-[#F43F5E] transition-colors"
                      title={`Visitar página de ${comment.authorName}`}
                    >
                      <img
                        src={comment.authorAvatar}
                        alt={comment.authorName}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </button>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => onVisitProfile?.(comment.authorId)}
                          className="font-semibold text-white hover:text-[#F43F5E] transition-colors text-left"
                        >
                          {comment.authorName}
                        </button>
                        <span className="text-slate-500">@{comment.authorUsername}</span>
                        <span aria-hidden="true" className="text-slate-700">·</span>
                        <span className="text-[11px] text-slate-400">{comment.createdAt}</span>
                      </div>

                      {/* Movie mention tag */}
                      {comment.movieMention && (
                        <div className="flex items-center gap-1.5 text-xs text-[#38BDF8]">
                          <Film className="h-3 w-3" />
                          <span className="font-medium">Falando sobre: {comment.movieMention}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions (Delete if author or profile owner) */}
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => onDeleteComment(comment.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-white/5 transition-all"
                      title="Excluir comentário"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Comment Content */}
                <div className="mt-3 pl-0 sm:pl-13 text-sm text-slate-200 leading-relaxed">
                  &ldquo;{comment.content}&rdquo;
                </div>

                {/* Like reaction button */}
                <div className="mt-3 pl-0 sm:pl-13 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onToggleLike(comment.id)}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs transition-colors ${
                      comment.hasLiked
                        ? 'bg-[#F43F5E]/20 text-[#F43F5E] font-medium border border-[#F43F5E]/30'
                        : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <Heart
                      className={`h-3.5 w-3.5 ${
                        comment.hasLiked ? 'fill-[#F43F5E] text-[#F43F5E]' : ''
                      }`}
                    />
                    <span className="tabular-nums font-mono">{comment.likes}</span>
                    <span className="text-[11px]">
                      {comment.likes === 1 ? 'curtida' : 'curtidas'}
                    </span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
