'use client';

import React, { useState } from 'react';
import { User, Movie, ProfileComment } from '@/lib/types';
import { Film, MessageSquare, Plus, Edit, UserPlus, Check, ArrowLeft, Star, Heart, LogOut, Users, X, AlertCircle, Trash2 } from 'lucide-react';

interface UserProfileHeaderProps {
  viewingUser: User;
  currentUser: User;
  isOwner: boolean;
  movies: Movie[];
  comments: ProfileComment[];
  isFollowed: boolean;
  activeTab: 'movies' | 'guestbook' | 'community';
  setActiveTab: (tab: 'movies' | 'guestbook' | 'community') => void;
  onOpenAddMovie: () => void;
  onOpenEditProfile: () => void;
  onToggleFollow: (userId: string) => void;
  onGoBackToMyProfile: () => void;
  onLogout?: () => void;
  onOpenAuth?: () => void;
  onDeleteProfile?: (userId: string) => void;
}

export function UserProfileHeader({
  viewingUser,
  currentUser,
  isOwner,
  movies,
  comments,
  isFollowed,
  activeTab,
  setActiveTab,
  onOpenAddMovie,
  onOpenEditProfile,
  onToggleFollow,
  onGoBackToMyProfile,
  onLogout,
  onOpenAuth,
  onDeleteProfile,
}: UserProfileHeaderProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const avgRating =
    movies.length > 0
      ? (movies.reduce((acc, m) => acc + m.rating, 0) / movies.length).toFixed(1)
      : '0.0';

  const totalLikes = movies.reduce((acc, m) => acc + (m.likesCount || 0), 0);

  return (
    <div className="relative mb-8 rounded-3xl border border-white/10 bg-[#12121A] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
      {/* Cover Banner */}
      <div className="relative h-44 sm:h-60 w-full overflow-hidden bg-slate-900">
        <img
          src={
            viewingUser.coverImage ||
            'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80'
          }
          alt="Banner do Perfil"
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#12121A] via-[#12121A]/50 to-black/30" />

        {/* Back to my profile button if visiting another cinephile */}
        {!isOwner && (
          <button
            type="button"
            onClick={onGoBackToMyProfile}
            className="absolute top-4 left-4 z-10 flex items-center gap-1.5 rounded-xl border border-white/20 bg-black/70 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-white hover:bg-black/90 hover:border-[#F43F5E] transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Voltar ao Meu Perfil</span>
          </button>
        )}
      </div>

      {/* Profile Details Container */}
      <div className="relative px-6 sm:px-10 pb-6 -mt-16 sm:-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/8">
          {/* Avatar and Identity */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
            {/* Avatar with Neon Ring */}
            <div className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-2xl overflow-hidden border-4 border-[#12121A] bg-slate-800 shadow-[0_0_24px_rgba(244,63,94,0.35)] shrink-0">
              <img
                src={viewingUser.avatar}
                alt={viewingUser.name}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Name, Username, Badge */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {viewingUser.name}
                </h2>
                {viewingUser.badge && (
                  <span className="font-meta text-[11px] font-bold uppercase tracking-wider text-[#FBBF24] bg-[#F59E0B]/12 border border-[#F59E0B]/30 rounded-md px-2.5 py-0.5">
                    {viewingUser.badge}
                  </span>
                )}
                {isOwner && (
                  <span className="font-meta text-[11px] text-[#38BDF8] bg-[#38BDF8]/10 border border-[#38BDF8]/25 rounded-md px-2 py-0.5">
                    Você
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-400">@{viewingUser.username}</p>

              {/* Clean unboxed genres list with typographic separators (§1.A anti-slop) */}
              {viewingUser.favoriteGenres && viewingUser.favoriteGenres.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400 pt-1">
                  <span className="text-slate-500">Gêneros preferidos:</span>
                  {viewingUser.favoriteGenres.map((g, idx) => (
                    <React.Fragment key={g}>
                      <span className="text-slate-200">{g}</span>
                      {idx < viewingUser.favoriteGenres.length - 1 && (
                        <span aria-hidden="true" className="text-slate-600">·</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons for Current or Visiting Profile */}
          <div className="flex flex-wrap items-center gap-3">
            {isOwner ? (
              <>
                <button
                  type="button"
                  onClick={onOpenEditProfile}
                  className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 py-2.5 px-4 text-xs font-semibold text-white hover:bg-white/10 hover:border-white/30 transition-all"
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span>Editar Perfil</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenAddMovie}
                  className="neon-btn-primary flex items-center gap-2 rounded-xl py-2.5 px-5 text-xs font-bold shadow-md"
                >
                  <Plus className="h-4 w-4" />
                  <span>Cadastrar Filme</span>
                </button>

                {onOpenAuth && (
                  <button
                    type="button"
                    onClick={onOpenAuth}
                    className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 py-2.5 px-3.5 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:border-[#38BDF8] hover:text-[#38BDF8] transition-all shadow-sm"
                    title="Acessar com outro usuário ou cadastrar nova conta"
                  >
                    <Users className="h-3.5 w-3.5 text-[#38BDF8]" />
                    <span>Trocar Usuário</span>
                  </button>
                )}

                {onLogout && (
                  <button
                    type="button"
                    onClick={() => setShowLogoutConfirm(true)}
                    className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 py-2.5 px-3.5 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all shadow-sm"
                    title="Fazer logoff ou sair do perfil para acessar com outro usuário"
                  >
                    <LogOut className="h-3.5 w-3.5 text-slate-400" />
                    <span>Sair / Logoff</span>
                  </button>
                )}

                {onDeleteProfile && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 py-2.5 px-3.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 hover:border-red-500/50 hover:text-white transition-all shadow-sm"
                    title="Excluir permanentemente este perfil e seus filmes"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Excluir Perfil</span>
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onToggleFollow(viewingUser.id)}
                  className={`flex items-center gap-1.5 rounded-xl py-2.5 px-4 text-xs font-semibold transition-all ${
                    isFollowed
                      ? 'border border-[#F43F5E]/40 bg-[#F43F5E]/20 text-[#F43F5E]'
                      : 'neon-btn-primary'
                  }`}
                >
                  {isFollowed ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Seguindo</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      <span>Seguir Cinéfilo</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('guestbook')}
                  className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/5 py-2.5 px-4 text-xs font-semibold text-white hover:border-[#38BDF8] hover:text-[#38BDF8] transition-all"
                >
                  <MessageSquare className="h-4 w-4 text-[#38BDF8]" />
                  <span>Deixar Mensagem</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Bio & Metrics Strip */}
        <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            {viewingUser.bio}
          </p>

          {/* Metrics in Tabular Numerals (§1.D) */}
          <div className="flex items-center gap-5 text-xs text-slate-400 shrink-0">
            <div className="flex flex-col">
              <span className="font-mono text-base font-bold text-white tabular-nums">
                {movies.length}
              </span>
              <span className="text-[11px] text-slate-400">Filmes Favoritos</span>
            </div>

            <div className="h-6 w-px bg-white/10" />

            <div className="flex flex-col">
              <span className="font-mono text-base font-bold text-[#FBBF24] tabular-nums flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-[#FBBF24]" />
                {avgRating}
              </span>
              <span className="text-[11px] text-slate-400">Média Geral</span>
            </div>

            <div className="h-6 w-px bg-white/10" />

            <div className="flex flex-col">
              <span className="font-mono text-base font-bold text-[#F43F5E] tabular-nums flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                {comments.length}
              </span>
              <span className="text-[11px] text-slate-400">Recados no Mural</span>
            </div>

            <div className="h-6 w-px bg-white/10" />

            <div className="flex flex-col">
              <span className="font-mono text-base font-bold text-white tabular-nums">
                {viewingUser.followersCount}
              </span>
              <span className="text-[11px] text-slate-400">Seguidores</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Functional buttons, §1.A) */}
        <div className="mt-6 flex items-center gap-2 border-t border-white/8 pt-4 overflow-x-auto pb-2 custom-scrollbar flex-nowrap">
          <button
            type="button"
            onClick={() => setActiveTab('movies')}
            className={`flex items-center gap-2 rounded-xl py-2 px-3.5 sm:px-4 text-xs font-semibold transition-all shrink-0 whitespace-nowrap ${
              activeTab === 'movies'
                ? 'bg-white/15 text-white border border-[#F43F5E]/50 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Film className="h-4 w-4 text-[#F43F5E]" />
            <span>Filmes Favoritos ({movies.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guestbook')}
            className={`flex items-center gap-2 rounded-xl py-2 px-3.5 sm:px-4 text-xs font-semibold transition-all shrink-0 whitespace-nowrap ${
              activeTab === 'guestbook'
                ? 'bg-white/15 text-white border border-[#F43F5E]/50 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageSquare className="h-4 w-4 text-[#38BDF8]" />
            <span>Mural de Visitas ({comments.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('community')}
            className={`flex items-center gap-2 rounded-xl py-2 px-3.5 sm:px-4 text-xs font-semibold transition-all shrink-0 whitespace-nowrap ${
              activeTab === 'community'
                ? 'bg-white/15 text-white border border-[#F43F5E]/50 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Star className="h-4 w-4 text-[#FBBF24]" />
            <span>Explorar Outros Cinéfilos</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal: Sair do Perfil / Logoff */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl border border-white/12 bg-[#12121A] p-6 sm:p-7 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.98),0_0_32px_0_rgba(244,63,94,0.25)]">
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.25)] shrink-0">
                <LogOut className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-white tracking-tight">
                  Sair do Perfil?
                </h3>
                <p className="text-xs text-slate-400">
                  Encerrar sessão de @{viewingUser.username}
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
              Você será desconectado da conta de <b>{viewingUser.name}</b> e retornará para a tela inicial de login, onde poderá entrar com outro e-mail e senha, criar um novo cadastro ou acessar como visitante.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  onLogout?.();
                }}
                className="w-full sm:flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 px-4 text-xs shadow-md transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sim, Fazer Logoff</span>
              </button>

              {onOpenAuth && (
                <button
                  type="button"
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    onOpenAuth();
                  }}
                  className="w-full sm:flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white font-semibold py-2.5 px-3 text-xs transition-colors"
                >
                  <Users className="h-3.5 w-3.5 text-[#38BDF8]" />
                  <span>Trocar Usuário</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full sm:w-auto rounded-xl px-4 py-2.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Excluir Perfil Definitivamente */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl border border-red-500/30 bg-[#141014] p-6 sm:p-7 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.98),0_0_36px_0_rgba(239,68,68,0.3)]">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600/20 border border-red-500/40 text-red-400 shadow-[0_0_24px_rgba(239,68,68,0.35)] shrink-0">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-white tracking-tight">
                  Excluir Perfil Definitivamente?
                </h3>
                <p className="text-xs text-red-300 font-medium">
                  Ação irreversível de exclusão
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <p>
                Tem certeza que deseja apagar a conta de <b>{viewingUser.name}</b> (@{viewingUser.username})?
              </p>
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-200 space-y-1">
                <p className="font-semibold text-red-300">Ao confirmar a exclusão:</p>
                <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                  <li>Seu perfil será permanentemente removido da rede.</li>
                  <li>Todos os seus filmes favoritados ({movies.length}) serão apagados.</li>
                  <li>Todos os recados deixados no seu mural serão excluídos.</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDeleteProfile?.(viewingUser.id);
                }}
                className="w-full sm:flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 text-xs shadow-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span>Sim, Excluir Perfil</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full sm:w-auto rounded-xl px-4 py-2.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
