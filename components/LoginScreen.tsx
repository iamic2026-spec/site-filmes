'use client';

import React, { useState, useRef } from 'react';
import { Film, Sparkles, UserPlus, LogIn, Check, ShieldCheck, ArrowRight, Star, Upload, Camera, Trash2 } from 'lucide-react';
import { User, Movie } from '@/lib/types';
import { processImageFile } from '@/lib/imageUtils';

interface LoginScreenProps {
  allUsers: User[];
  allMovies: Movie[];
  onLoginAsGuest: () => void;
  onRegisterUser: (userData: {
    name: string;
    username: string;
    bio: string;
    avatar?: string;
    favoriteGenres: string[];
  }) => void;
  onSelectExistingUser: (userId: string) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=400&q=80',
];

const GENRES_LIST = [
  'Ficção Científica',
  'Drama',
  'Suspense',
  'Ação',
  'Terror',
  'Animação',
  'Crime',
  'Romance',
  'Neo-Noir',
  'Clássicos',
];

export function LoginScreen({
  allUsers,
  allMovies,
  onLoginAsGuest,
  onRegisterUser,
  onSelectExistingUser,
}: LoginScreenProps) {
  // Tabs: 'register' (Novo Cadastro) | 'login' (Entrar com Conta) | 'guest' (Entrar como Visitante)
  const [activeTab, setActiveTab] = useState<'register' | 'login' | 'guest'>('register');

  // Register state
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regBio, setRegBio] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);
  const [uploadedAvatar, setUploadedAvatar] = useState<string | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Ficção Científica', 'Drama']);
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingUpload(true);
      setErrorMessage('');
      const optimizedDataUrl = await processImageFile(file, 300);
      setUploadedAvatar(optimizedDataUrl);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Erro ao carregar a foto de perfil.');
    } finally {
      setIsProcessingUpload(false);
      // Reset input value so user can upload same file again if desired
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveUploadedAvatar = () => {
    setUploadedAvatar(null);
  };

  // Existing user selection
  const [selectedExistingId, setSelectedExistingId] = useState(allUsers[0]?.id || '');

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) {
      setErrorMessage('Por favor, informe seu nome ou apelido para o cadastro.');
      return;
    }
    setErrorMessage('');
    onRegisterUser({
      name: regName.trim(),
      username: regUsername.trim() || regName.toLowerCase().replace(/\s+/g, '_'),
      bio: regBio.trim(),
      avatar: uploadedAvatar || selectedAvatar,
      favoriteGenres: selectedGenres,
    });
  };

  const handleExistingLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedExistingId) {
      onSelectExistingUser(selectedExistingId);
    }
  };

  // Preview background posters
  const backgroundPosters = allMovies.slice(0, 8);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden bg-[#0A0A0E]">
      {/* Background Poster Marquee Wall with Blur Scrim */}
      <div className="absolute inset-0 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 opacity-15 filter blur-[2px] pointer-events-none scale-105">
        {backgroundPosters.map((m, i) => (
          <div key={i} className="aspect-[2/3] rounded-xl overflow-hidden bg-slate-900">
            <img
              src={m.posterUrl}
              alt=""
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        ))}
      </div>

      {/* Dramatic Vignette & Ambient Radial Glows */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0E] via-[#0A0A0E]/85 to-[#0A0A0E]/90 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[radial-gradient(ellipse_at_center,_rgba(244,63,94,0.18),_transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[450px] h-[350px] bg-[radial-gradient(circle_at_center,_rgba(251,191,36,0.1),_transparent_65%)] pointer-events-none" />

      {/* Main Glassmorphic Card Container */}
      <div className="relative z-10 w-full max-w-xl rounded-3xl border border-white/12 bg-[#12121A]/95 p-6 sm:p-10 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.98),0_0_36px_0_rgba(244,63,94,0.25)] backdrop-blur-2xl">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F43F5E] via-[#E11D48] to-[#9F1239] text-white shadow-[0_0_24px_rgba(244,63,94,0.5)] mb-3">
            <Film className="h-7 w-7" />
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            CineLumina
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300">
            Rede social para amantes de cinema. Cadastre filmes, avalie e interaja com cinéfilos.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="mb-6 flex rounded-xl border border-white/8 bg-black/50 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition-all ${
              activeTab === 'register'
                ? 'bg-[#F43F5E] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="h-4 w-4" />
            <span>Novo Cadastro</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition-all ${
              activeTab === 'login'
                ? 'bg-[#F43F5E] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="h-4 w-4" />
            <span>Entrar / Contas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guest')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition-all ${
              activeTab === 'guest'
                ? 'bg-[#F43F5E] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="h-4 w-4 text-[#FBBF24]" />
            <span>Visitante</span>
          </button>
        </div>

        {/* TAB 1: NOVO CADASTRO */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {errorMessage && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-2.5 text-xs text-red-300">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nome Completo ou Apelido Cinéfilo *
              </label>
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Ex: Matheus Silva, Julia Cineasta..."
                className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#F43F5E] focus:outline-none focus:ring-1 focus:ring-[#F43F5E]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nome de Usuário (@handle)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-500 text-sm">@</span>
                <input
                  type="text"
                  value={regUsername}
                  onChange={(e) =>
                    setRegUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                  }
                  placeholder="seu_usuario"
                  className="w-full rounded-xl border border-white/10 bg-black/60 pl-8 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#F43F5E] focus:outline-none focus:ring-1 focus:ring-[#F43F5E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Biografia / Frase que define seu amor por filmes
              </label>
              <textarea
                rows={2}
                value={regBio}
                onChange={(e) => setRegBio(e.target.value)}
                placeholder="Ex: Apaixonado por ficção científica, suspense psicológico e clássicos dos anos 90."
                className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-[#F43F5E] focus:outline-none focus:ring-1 focus:ring-[#F43F5E] resize-none"
              />
            </div>

            {/* Avatar / Profile Photo Upload & Presets */}
            <div className="space-y-3 rounded-2xl border border-white/8 bg-white/3 p-4">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300">
                  Foto de Perfil ou Avatar *
                </label>
                {uploadedAvatar && (
                  <span className="text-[11px] text-[#FBBF24] font-medium flex items-center gap-1">
                    <Check className="h-3 w-3" /> Foto personalizada ativa
                  </span>
                )}
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="login-avatar-upload"
              />

              {/* Upload Action Row */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Active Avatar Circular Preview */}
                <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-[#F43F5E] shadow-[0_0_16px_rgba(244,63,94,0.4)] shrink-0 bg-slate-800">
                  <img
                    src={uploadedAvatar || selectedAvatar}
                    alt="Foto do Perfil"
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {isProcessingUpload && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#F43F5E] border-t-transparent" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-1.5 w-full text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isProcessingUpload}
                      className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/8 px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#F43F5E]/20 hover:border-[#F43F5E] hover:text-[#F43F5E] transition-all"
                    >
                      <Upload className="h-3.5 w-3.5 text-[#FBBF24]" />
                      <span>{uploadedAvatar ? 'Trocar Foto do Perfil' : 'Fazer Upload da Foto'}</span>
                    </button>

                    {uploadedAvatar && (
                      <button
                        type="button"
                        onClick={handleRemoveUploadedAvatar}
                        className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 px-2.5 py-2 text-xs text-red-400 hover:bg-red-500/20 transition-colors"
                        title="Remover foto enviada"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Remover</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Formatos JPG, PNG ou WEBP (redimensionamento automático).
                  </p>
                </div>
              </div>

              {/* Preset Avatars Carousel */}
              <div className="pt-2 border-t border-white/5">
                <span className="block text-[11px] text-slate-400 mb-2">
                  Ou selecione um avatar cinematográfico pronto:
                </span>
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1 custom-scrollbar">
                  {PRESET_AVATARS.map((url, i) => {
                    const isCurrent = !uploadedAvatar && selectedAvatar === url;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setSelectedAvatar(url);
                          setUploadedAvatar(null);
                        }}
                        className={`relative h-11 w-11 rounded-full overflow-hidden border-2 transition-transform shrink-0 ${
                          isCurrent
                            ? 'border-[#F43F5E] scale-110 shadow-[0_0_12px_rgba(244,63,94,0.6)]'
                            : 'border-white/15 opacity-70 hover:opacity-100 hover:scale-105'
                        }`}
                      >
                        <img
                          src={url}
                          alt="Avatar"
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {isCurrent && (
                          <div className="absolute inset-0 bg-[#F43F5E]/30 flex items-center justify-center">
                            <Check className="h-3.5 w-3.5 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Favorite genres selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Gêneros que Mais Gosta
              </label>
              <div className="flex flex-wrap gap-1.5">
                {GENRES_LIST.map((genre) => {
                  const isSelected = selectedGenres.includes(genre);
                  return (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => toggleGenre(genre)}
                      className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                        isSelected
                          ? 'bg-[#F43F5E] text-white font-medium'
                          : 'bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {genre}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 neon-btn-primary flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-sm font-bold shadow-lg"
            >
              <UserPlus className="h-4 w-4" />
              <span>Concluir Cadastro & Entrar na Rede</span>
            </button>
          </form>
        )}

        {/* TAB 2: ENTRAR COM CONTA EXISTENTE */}
        {activeTab === 'login' && (
          <form onSubmit={handleExistingLogin} className="space-y-4">
            <p className="text-xs text-slate-400">
              Selecione seu perfil já cadastrado ou use uma das contas de cinéfilos da comunidade:
            </p>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
              {allUsers.map((user) => {
                const isSelected = selectedExistingId === user.id;
                return (
                  <div
                    key={user.id}
                    onClick={() => setSelectedExistingId(user.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#F43F5E] bg-[#F43F5E]/15 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                        : 'border-white/8 bg-white/5 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-10 w-10 rounded-full object-cover border border-white/20 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white text-sm">{user.name}</span>
                          {user.badge && (
                            <span className="text-[10px] text-[#FBBF24] font-meta uppercase tracking-wider">
                              {user.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">@{user.username}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isSelected ? (
                        <div className="h-6 w-6 rounded-full bg-[#F43F5E] flex items-center justify-center text-white">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">Selecionar</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="submit"
              className="w-full mt-3 neon-btn-primary flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-sm font-bold shadow-lg"
            >
              <LogIn className="h-4 w-4" />
              <span>Entrar com a Conta Selecionada</span>
            </button>
          </form>
        )}

        {/* TAB 3: ACESSO IMEDIATO VISITANTE */}
        {activeTab === 'guest' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-[#F43F5E]/30 bg-[#F43F5E]/10 p-6">
              <div className="flex items-start gap-3.5">
                <ShieldCheck className="h-7 w-7 text-[#F43F5E] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-white text-base">
                    Acesso Rápido para Visitantes
                  </h3>
                  <p className="mt-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Entre sem preencher formulários! Como visitante, você poderá explorar todos os perfis, cadastrar seus filmes favoritos, editar sua lista e comentar nos murais de outros cinéfilos.
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={onLoginAsGuest}
                  className="w-full neon-btn-primary flex items-center justify-center gap-2 rounded-xl py-3.5 px-6 text-sm font-bold shadow-lg"
                >
                  <Sparkles className="h-4 w-4 text-[#FBBF24]" />
                  <span>Entrar Imediatamente como Visitante</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <Star className="h-3.5 w-3.5 text-[#FBBF24] fill-[#FBBF24]" />
              <span>Você poderá criar uma conta com seu próprio nome a qualquer momento!</span>
            </div>
          </div>
        )}

        {/* Bottom Switcher Note */}
        <div className="mt-6 pt-5 border-t border-white/8 flex items-center justify-between text-xs text-slate-400">
          <span>Deseja apenas testar rápido?</span>
          <button
            type="button"
            onClick={onLoginAsGuest}
            className="text-[#F43F5E] hover:underline font-semibold"
          >
            Acessar como Visitante &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
