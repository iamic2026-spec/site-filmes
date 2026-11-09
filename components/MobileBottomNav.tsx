'use client';

import React from 'react';
import { Film, Users, MessageSquare, Plus, LogOut, User as UserIcon } from 'lucide-react';
import { User } from '@/lib/types';

interface MobileBottomNavProps {
  currentUser: User;
  isViewingOwnProfile: boolean;
  activeTab: 'movies' | 'guestbook' | 'community';
  totalMovies: number;
  totalComments: number;
  onGoToMyProfile: () => void;
  onOpenCommunity: () => void;
  onOpenGuestbook: () => void;
  onOpenAddMovie: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export function MobileBottomNav({
  currentUser,
  isViewingOwnProfile,
  activeTab,
  totalMovies,
  totalComments,
  onGoToMyProfile,
  onOpenCommunity,
  onOpenGuestbook,
  onOpenAddMovie,
  onOpenAuth,
  onLogout,
}: MobileBottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-white/10 bg-[#0A0A0E]/95 backdrop-blur-lg px-2 py-1.5 shadow-[0_-10px_30px_rgba(0,0,0,0.85)]">
      <nav className="flex items-center justify-around">
        {/* Tab 1: Meu Perfil */}
        <button
          type="button"
          onClick={() => {
            onGoToMyProfile();
          }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            isViewingOwnProfile && activeTab === 'movies'
              ? 'text-[#F43F5E]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className="relative">
            <Film className="h-5 w-5" />
            {totalMovies > 0 && (
              <span className="absolute -top-1 -right-2 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#F43F5E] px-1 text-[9px] font-bold text-white">
                {totalMovies}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium mt-1">Meu Perfil</span>
        </button>

        {/* Tab 2: Comunidade */}
        <button
          type="button"
          onClick={onOpenCommunity}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            activeTab === 'community'
              ? 'text-[#FBBF24]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="h-5 w-5" />
          <span className="text-[10px] font-medium mt-1">Cinéfilos</span>
        </button>

        {/* Tab 3: Action Button: Cadastrar Filme (Centered Raised Button) */}
        <button
          type="button"
          onClick={onOpenAddMovie}
          className="-mt-5 flex flex-col items-center justify-center focus:outline-none group"
          title="Cadastrar Novo Filme"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-[#F43F5E] via-[#E11D48] to-[#BE185D] text-white shadow-[0_0_20px_rgba(244,63,94,0.6)] border-2 border-[#12121A] transition-transform active:scale-95 group-hover:scale-105">
            <Plus className="h-6 w-6" />
          </div>
          <span className="text-[10px] font-bold text-white mt-0.5">Cadastrar</span>
        </button>

        {/* Tab 4: Mural de Recados */}
        <button
          type="button"
          onClick={onOpenGuestbook}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            activeTab === 'guestbook'
              ? 'text-[#38BDF8]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className="relative">
            <MessageSquare className="h-5 w-5" />
            {totalComments > 0 && (
              <span className="absolute -top-1 -right-2 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#38BDF8] px-1 text-[9px] font-bold text-black">
                {totalComments}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium mt-1">Mural</span>
        </button>

        {/* Tab 5: Conta / Sair */}
        <button
          type="button"
          onClick={onOpenAuth}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-400 hover:text-white transition-all"
          title="Gerenciar Conta / Trocar Usuário"
        >
          <div className="relative h-5 w-5 rounded-full overflow-hidden border border-white/20">
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <UserIcon className="h-full w-full text-slate-400" />
            )}
          </div>
          <span className="text-[10px] font-medium mt-1">Conta</span>
        </button>
      </nav>
    </div>
  );
}
