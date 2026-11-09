'use client';

import React from 'react';
import { Film, Plus, Users, User as UserIcon, Sparkles, LogOut, Database } from 'lucide-react';
import { User } from '@/lib/types';

interface NavbarProps {
  currentUser: User;
  viewingUser: User;
  isViewingOwnProfile: boolean;
  activeTab: 'movies' | 'guestbook' | 'community';
  setActiveTab: (tab: 'movies' | 'guestbook' | 'community') => void;
  onOpenAddMovie: () => void;
  onOpenAuth: () => void;
  onGoToMyProfile: () => void;
  onOpenCommunity: () => void;
  onResetData: () => void;
  onLogout: () => void;
  onOpenSupabaseConfig?: () => void;
}

export function Navbar({
  currentUser,
  viewingUser,
  isViewingOwnProfile,
  activeTab,
  setActiveTab,
  onOpenAddMovie,
  onOpenAuth,
  onGoToMyProfile,
  onOpenCommunity,
  onLogout,
  onOpenSupabaseConfig,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/8 bg-[#0A0A0E]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={onGoToMyProfile}
          className="group flex items-center gap-2.5 text-left transition-opacity hover:opacity-90 shrink-0"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#F43F5E] to-[#BE185D] text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]">
            <Film className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg font-bold tracking-tight text-white group-hover:text-[#F43F5E] transition-colors whitespace-nowrap">
              CineLumina
            </span>
          </div>
        </button>

        {/* Zone 2: 4-5 single-line clean text navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <button
            onClick={() => {
              onGoToMyProfile();
              setActiveTab('movies');
            }}
            className={`whitespace-nowrap transition-colors py-1 hover:text-white ${
              isViewingOwnProfile && activeTab === 'movies'
                ? 'text-[#F43F5E] border-b-2 border-[#F43F5E]'
                : 'text-slate-300'
            }`}
          >
            Meu Perfil
          </button>

          <button
            onClick={onOpenCommunity}
            className={`whitespace-nowrap transition-colors py-1 hover:text-white flex items-center gap-1.5 ${
              activeTab === 'community'
                ? 'text-[#F43F5E] border-b-2 border-[#F43F5E]'
                : 'text-slate-300'
            }`}
          >
            <Users className="h-4 w-4 text-[#FBBF24]" />
            Explorar Outros Cinéfilos
          </button>

          <button
            onClick={() => {
              setActiveTab('guestbook');
            }}
            className={`whitespace-nowrap transition-colors py-1 hover:text-white ${
              activeTab === 'guestbook'
                ? 'text-[#F43F5E] border-b-2 border-[#F43F5E]'
                : 'text-slate-300'
            }`}
          >
            Mural de Comentários
          </button>
        </nav>

        {/* Zone 3: 1 primary action / user zone */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Quick Add Movie CTA */}
          <button
            onClick={onOpenAddMovie}
            className="neon-btn-primary flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold whitespace-nowrap shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Cadastrar Filme</span>
            <span className="sm:hidden">Filme</span>
          </button>

          {/* User Profile / Switcher button */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 hover:bg-white/10 hover:border-[#F43F5E]/40 transition-all text-xs text-white"
            title="Trocar usuário ou cadastrar"
          >
            <div className="relative h-7 w-7 overflow-hidden rounded-full border border-white/20 bg-slate-800">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <UserIcon className="h-full w-full p-1 text-slate-400" />
              )}
            </div>
            <div className="hidden lg:flex flex-col text-left leading-tight">
              <span className="font-medium text-slate-200 truncate max-w-[100px]">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-slate-400">
                {currentUser.isGuest ? 'Visitante' : `@${currentUser.username}`}
              </span>
            </div>
            <Sparkles className="h-3.5 w-3.5 text-[#FBBF24] hidden sm:block" />
          </button>

          {/* Supabase status / config button */}
          {onOpenSupabaseConfig && (
            <button
              onClick={onOpenSupabaseConfig}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 p-2 text-[#3ECF8E] hover:border-[#3ECF8E]/40 hover:bg-[#3ECF8E]/10 transition-colors"
              title="Configurar variáveis de conexão do Supabase"
              aria-label="Configurar Supabase"
            >
              <Database className="h-4 w-4" />
              <span className="hidden xl:inline text-xs font-mono">Supabase</span>
            </button>
          )}

          {/* Sair / Logout button */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 p-2 text-slate-400 hover:text-[#F43F5E] hover:border-[#F43F5E]/30 hover:bg-[#F43F5E]/10 transition-colors"
            title="Sair / Trocar para tela de login"
            aria-label="Sair da conta"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden xl:inline text-xs">Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
}
