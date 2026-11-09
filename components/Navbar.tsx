'use client';

import React, { useState } from 'react';
import { Film, Plus, Users, User as UserIcon, Sparkles, LogOut, Database, Menu, X, MessageSquare, ArrowRight, ShieldCheck } from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileNav = (action: () => void) => {
    action();
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/8 bg-[#0A0A0E]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => {
            onGoToMyProfile();
            setActiveTab('movies');
          }}
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

        {/* Zone 2: Desktop Navigation Links */}
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

        {/* Zone 3: Desktop and Mobile Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick Add Movie CTA (Desktop & Mobile) */}
          <button
            onClick={onOpenAddMovie}
            className="neon-btn-primary flex items-center gap-1.5 sm:gap-2 rounded-lg px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-semibold whitespace-nowrap shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Cadastrar Filme</span>
            <span className="sm:hidden">Filme</span>
          </button>

          {/* Desktop User Profile Pill */}
          <button
            onClick={onOpenAuth}
            className="hidden sm:flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 hover:bg-white/10 hover:border-[#F43F5E]/40 transition-all text-xs text-white"
            title="Trocar usuário ou cadastrar"
          >
            <div className="relative h-7 w-7 overflow-hidden rounded-full border border-white/20 bg-slate-800 shrink-0">
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

          {/* Desktop Supabase status / config button */}
          {onOpenSupabaseConfig && (
            <button
              onClick={onOpenSupabaseConfig}
              className="hidden md:flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 p-2 text-[#3ECF8E] hover:border-[#3ECF8E]/40 hover:bg-[#3ECF8E]/10 transition-colors"
              title="Configurar variáveis de conexão do Supabase"
              aria-label="Configurar Supabase"
            >
              <Database className="h-4 w-4" />
              <span className="hidden xl:inline text-xs font-mono">Supabase</span>
            </button>
          )}

          {/* Desktop Sair / Logout button */}
          <button
            onClick={onLogout}
            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 p-2 text-slate-400 hover:text-[#F43F5E] hover:border-[#F43F5E]/30 hover:bg-[#F43F5E]/10 transition-colors"
            title="Sair / Trocar para tela de login"
            aria-label="Sair da conta"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden xl:inline text-xs">Sair</span>
          </button>

          {/* Mobile Menu Toggle Button (Visible only on mobile devices) */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex items-center justify-center h-9 w-9 rounded-xl border border-white/15 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-all"
            aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu de navegação'}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation (100% sync with desktop options) */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0E0E15]/98 px-4 py-5 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-2 duration-200">
          {/* Active User Card on Mobile */}
          <div className="mb-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3.5">
            <div className="flex items-center gap-3">
              <div className="relative h-11 w-11 rounded-full overflow-hidden border-2 border-[#F43F5E] bg-slate-800 shrink-0">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white text-sm">{currentUser.name}</span>
                  {currentUser.badge && (
                    <span className="text-[9px] text-[#FBBF24] font-meta uppercase tracking-wider bg-[#FBBF24]/10 border border-[#FBBF24]/20 px-1.5 py-0.5 rounded">
                      {currentUser.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  {currentUser.isGuest ? 'Acesso de Visitante' : `@${currentUser.username}`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleMobileNav(onOpenAuth)}
              className="text-xs text-[#38BDF8] hover:underline font-semibold px-2 py-1"
            >
              Trocar
            </button>
          </div>

          {/* Navigation Links for Mobile */}
          <div className="space-y-1 text-sm font-medium">
            <button
              type="button"
              onClick={() =>
                handleMobileNav(() => {
                  onGoToMyProfile();
                  setActiveTab('movies');
                })
              }
              className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 transition-colors ${
                isViewingOwnProfile && activeTab === 'movies'
                  ? 'bg-[#F43F5E]/20 text-[#F43F5E] border border-[#F43F5E]/30 font-bold'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Film className="h-4 w-4" />
                <span>Meu Perfil & Filmes</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-500" />
            </button>

            <button
              type="button"
              onClick={() =>
                handleMobileNav(() => {
                  setActiveTab('community');
                })
              }
              className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 transition-colors ${
                activeTab === 'community'
                  ? 'bg-[#F43F5E]/20 text-[#F43F5E] border border-[#F43F5E]/30 font-bold'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-[#FBBF24]" />
                <span>Explorar Outros Cinéfilos</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-500" />
            </button>

            <button
              type="button"
              onClick={() =>
                handleMobileNav(() => {
                  setActiveTab('guestbook');
                })
              }
              className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 transition-colors ${
                activeTab === 'guestbook'
                  ? 'bg-[#F43F5E]/20 text-[#F43F5E] border border-[#F43F5E]/30 font-bold'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="h-4 w-4 text-[#38BDF8]" />
                <span>Mural de Comentários</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-500" />
            </button>

            <button
              type="button"
              onClick={() => handleMobileNav(onOpenAddMovie)}
              className="w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-white bg-gradient-to-r from-[#F43F5E]/20 to-[#BE185D]/20 border border-[#F43F5E]/40 hover:bg-[#F43F5E]/30 transition-all font-semibold"
            >
              <div className="flex items-center gap-3">
                <Plus className="h-4 w-4 text-[#F43F5E]" />
                <span>Cadastrar Novo Filme</span>
              </div>
              <span className="text-xs bg-[#F43F5E] text-white px-2 py-0.5 rounded font-bold">Novo</span>
            </button>
          </div>

          {/* Quick Utility Actions in Mobile Drawer */}
          <div className="mt-4 pt-3 border-t border-white/8 space-y-2">
            <button
              type="button"
              onClick={() => handleMobileNav(onOpenAuth)}
              className="w-full flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all"
            >
              <div className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-[#38BDF8]" />
                <span>Alternar Conta / Trocar Cinéfilo</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Pede Senha</span>
            </button>

            {onOpenSupabaseConfig && (
              <button
                type="button"
                onClick={() => handleMobileNav(onOpenSupabaseConfig)}
                className="w-full flex items-center justify-between rounded-xl border border-[#3ECF8E]/30 bg-[#3ECF8E]/10 px-3.5 py-2 text-xs font-semibold text-[#3ECF8E] hover:bg-[#3ECF8E]/20 transition-all"
              >
                <div className="flex items-center gap-2">
                  <Database className="h-3.5 w-3.5" />
                  <span>Configurações Supabase (.env)</span>
                </div>
                <span className="text-[10px] font-mono">Auth/DB</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleMobileNav(onLogout)}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/20 hover:text-white transition-all"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair / Fazer Logoff</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
