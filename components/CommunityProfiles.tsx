'use client';

import React from 'react';
import { Users, Star, Film, ArrowRight, UserPlus, Check } from 'lucide-react';
import { User, Movie } from '@/lib/types';

interface CommunityProfilesProps {
  allUsers: User[];
  currentUserId: string;
  allMovies: Movie[];
  followedUserIds: string[];
  onVisitProfile: (userId: string) => void;
  onToggleFollow: (userId: string) => void;
}

export function CommunityProfiles({
  allUsers,
  currentUserId,
  allMovies,
  followedUserIds,
  onVisitProfile,
  onToggleFollow,
}: CommunityProfilesProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/8 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FBBF24]/20 text-[#FBBF24]">
              <Users className="h-4 w-4" />
            </div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-white">
              Cinéfilos da Comunidade
            </h3>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Acesse as páginas pessoais de outros amantes de cinema, conheça suas obras favoritas e deixe sua opinião no mural.
          </p>
        </div>

        <div className="text-xs text-slate-400 bg-white/5 rounded-lg px-3 py-1.5 border border-white/5 self-start sm:self-auto">
          <span className="text-[#38BDF8] font-bold font-mono">{allUsers.length}</span> cinéfilos conectados
        </div>
      </div>

      {/* Grid of Cinephile Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {allUsers.map((user) => {
          const isCurrentUser = user.id === currentUserId;
          const isFollowed = followedUserIds.includes(user.id);
          const userMovies = allMovies.filter((m) => m.userId === user.id);
          const topMovies = userMovies.slice(0, 3);
          const avgRating =
            userMovies.length > 0
              ? (
                  userMovies.reduce((acc, m) => acc + m.rating, 0) / userMovies.length
                ).toFixed(1)
              : null;

          return (
            <div
              key={user.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-white/8 bg-[#12121A] p-5 transition-all duration-300 hover:border-[#F43F5E]/50 hover:bg-[#161622] hover:shadow-[0_16px_32px_-8px_rgba(0,0,0,0.8),0_0_20px_rgba(244,63,94,0.18)]"
            >
              <div>
                {/* Header Profile Row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 rounded-full overflow-hidden border border-white/20 bg-slate-800 shrink-0">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <h4 className="font-display text-sm sm:text-base font-bold text-white group-hover:text-[#F43F5E] transition-colors">
                        {user.name}
                      </h4>
                      <p className="text-xs text-slate-400">@{user.username}</p>
                    </div>
                  </div>

                  {/* Badge */}
                  {user.badge && (
                    <span className="font-meta text-[10px] uppercase tracking-wider text-[#FBBF24] bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-md px-2 py-0.5 shrink-0">
                      {user.badge}
                    </span>
                  )}
                </div>

                {/* Bio */}
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-4">
                  {user.bio}
                </p>

                {/* Metrics unboxed (§1.A anti-slop) */}
                <div className="flex items-center gap-3 text-xs text-slate-400 pb-3 mb-3 border-b border-white/5">
                  <div className="flex items-center gap-1">
                    <Film className="h-3.5 w-3.5 text-[#38BDF8]" />
                    <span className="text-white font-mono tabular-nums font-semibold">
                      {userMovies.length}
                    </span>
                    <span>favoritos</span>
                  </div>

                  {avgRating && (
                    <>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-[#FBBF24] fill-[#FBBF24]" />
                        <span className="text-[#FBBF24] font-mono tabular-nums font-semibold">
                          {avgRating}
                        </span>
                        <span>média</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Mini Posters Preview */}
                <div className="mb-4">
                  <span className="block text-[11px] font-semibold text-slate-400 mb-2">
                    Destaques da Coleção:
                  </span>
                  {topMovies.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {topMovies.map((movie) => (
                        <div
                          key={movie.id}
                          className="relative aspect-[2/3] rounded-lg overflow-hidden border border-white/10 bg-slate-800"
                        >
                          <img
                            src={movie.posterUrl}
                            alt={movie.title}
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1">
                            <span className="text-[10px] font-mono font-bold text-[#FBBF24]">
                              ★ {Number(movie.rating).toFixed(1)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-white/10 p-3 text-center text-xs text-slate-500">
                      Nenhum filme cadastrado ainda.
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => onVisitProfile(user.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 py-2 px-3 text-xs font-semibold text-white hover:border-[#F43F5E] hover:bg-[#F43F5E]/10 hover:text-[#F43F5E] transition-all"
                >
                  <span>{isCurrentUser ? 'Ver Meu Perfil' : 'Visitar Perfil'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>

                {!isCurrentUser && (
                  <button
                    type="button"
                    onClick={() => onToggleFollow(user.id)}
                    className={`flex items-center justify-center gap-1 rounded-xl py-2 px-3 text-xs font-semibold transition-all ${
                      isFollowed
                        ? 'border border-[#F43F5E]/40 bg-[#F43F5E]/20 text-[#F43F5E]'
                        : 'border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                    title={isFollowed ? 'Deixar de seguir' : 'Seguir este cinéfilo'}
                  >
                    {isFollowed ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Seguindo</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-3.5 w-3.5" />
                        <span>Seguir</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
