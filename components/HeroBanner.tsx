'use client';

import React from 'react';
import { Film, Plus, Users, Sparkles, Star } from 'lucide-react';
import { User, Movie } from '@/lib/types';

interface HeroBannerProps {
  currentUser: User;
  totalMovies: number;
  totalCinephiles: number;
  featuredMovie?: Movie;
  onOpenAddMovie: () => void;
  onOpenCommunity: () => void;
  onOpenAuth: () => void;
}

export function HeroBanner({
  currentUser,
  totalMovies,
  totalCinephiles,
  featuredMovie,
  onOpenAddMovie,
  onOpenCommunity,
  onOpenAuth,
}: HeroBannerProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#161622] via-[#0E0E14] to-[#0A0A0E] p-6 sm:p-10 lg:p-12 mb-10 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.95)]">
      {/* Ambient Radial Spotlight Flares */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[radial-gradient(ellipse_at_center,_rgba(244,63,94,0.18),_transparent_70%)] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle_at_top_right,_rgba(251,191,36,0.08),_transparent_65%)] pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Headlines & Call to Actions */}
        <div className="lg:col-span-7 space-y-6">
          {/* Subtle Top Kicker (§1.A no static pill, clean text) */}
          <div className="flex items-center gap-2 text-xs font-meta tracking-wider text-[#F43F5E] uppercase font-semibold">
            <Sparkles className="h-4 w-4 text-[#FBBF24]" />
            <span>Rede Social Para Amantes da Sétima Arte</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-400">Cinematic Neon Lumina</span>
          </div>

          {/* Hero Headline (§1.D no orphan words, Syne font) */}
          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] text-balance">
            Seus filmes favoritos reunidos em uma{' '}
            <span className="bg-gradient-to-r from-[#F43F5E] via-[#FF1493] to-[#FBBF24] bg-clip-text text-transparent">
              galeria cinematográfica
            </span>
            .
          </h1>

          {/* Subheading */}
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
            Crie sua coleção pessoal, avalie com sua própria nota, visite as páginas de outros cinéfilos e troque impressões no mural de visitas. Comece como visitante ou faça seu cadastro em segundos.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onOpenAddMovie}
              className="neon-btn-primary flex items-center gap-2 rounded-xl py-3 px-5 text-sm font-bold shadow-lg"
            >
              <Plus className="h-4 w-4" />
              <span>Cadastrar Filme Favorito</span>
            </button>

            <button
              type="button"
              onClick={onOpenCommunity}
              className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 py-3 px-5 text-sm font-semibold text-white hover:border-[#FBBF24]/50 hover:bg-white/10 transition-all"
            >
              <Users className="h-4 w-4 text-[#FBBF24]" />
              <span>Explorar Cinéfilos ({totalCinephiles})</span>
            </button>

            {currentUser.isGuest && (
              <button
                type="button"
                onClick={onOpenAuth}
                className="text-xs text-[#38BDF8] hover:underline px-2 py-1 font-medium"
              >
                Criar conta definitiva &rarr;
              </button>
            )}
          </div>

          {/* Unboxed Metrics Strip (§1.A / §1.D tabular numbers) */}
          <div className="pt-4 border-t border-white/8 flex flex-wrap items-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Film className="h-4 w-4 text-[#F43F5E]" />
              <span className="text-white font-mono font-bold tabular-nums text-sm">
                {totalMovies}
              </span>
              <span>filmes cadastrados</span>
            </div>

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[#FBBF24]" />
              <span className="text-white font-mono font-bold tabular-nums text-sm">
                {totalCinephiles}
              </span>
              <span>perfis ativos</span>
            </div>

            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-[#38BDF8] fill-[#38BDF8]" />
              <span className="text-white font-mono font-bold tabular-nums text-sm">
                100%
              </span>
              <span>paixão por cinema</span>
            </div>
          </div>
        </div>

        {/* Right Column: Featured Showcase Card */}
        {featuredMovie && (
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl border border-white/10 bg-[#12121A] p-4 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.85)] overflow-hidden group">
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-4 bg-slate-900">
                <img
                  src={featuredMovie.backdropUrl || featuredMovie.posterUrl}
                  alt={featuredMovie.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-lg border border-[#F59E0B]/30 bg-black/75 px-2.5 py-1 text-xs font-bold text-[#FBBF24] backdrop-blur-md">
                  <Star className="h-3.5 w-3.5 fill-[#FBBF24]" />
                  <span className="font-mono tabular-nums">{Number(featuredMovie.rating).toFixed(1)}</span>
                </div>

                <div className="absolute bottom-3 left-3 right-3">
                  <span className="font-meta text-[11px] uppercase tracking-wider text-[#38BDF8] font-bold">
                    Destaque da Comunidade
                  </span>
                  <h3 className="font-display text-lg sm:text-xl font-bold text-white line-clamp-1">
                    {featuredMovie.title}
                  </h3>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="text-white font-medium">{featuredMovie.director}</span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span>{featuredMovie.year}</span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span>{featuredMovie.genre}</span>
                </div>

                <p className="text-xs italic text-slate-300 line-clamp-2 leading-relaxed bg-white/5 rounded-lg p-2.5 border border-white/5">
                  &ldquo;{featuredMovie.userReview}&rdquo;
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
