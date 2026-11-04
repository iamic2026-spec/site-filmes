'use client';
import React, { useState, useRef } from 'react';
import { X, UserCheck, Sparkles, UserPlus, LogIn, Film, Check, ShieldCheck, Upload, Trash2 } from 'lucide-react';
import { User } from '@/lib/types';
import { processImageFile } from '@/lib/imageUtils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  allUsers: User[];
  onSwitchUser: (userId: string) => void;
  onLoginAsGuest: () => void;
  onRegisterUser: (userData: {
    name: string;
    username: string;
    bio: string;
    avatar?: string;
    favoriteGenres: string[];
  }) => void;
  onResetData: () => void;
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

export function AuthModal({
  isOpen,
  onClose,
  currentUser,
  allUsers,
  onSwitchUser,
  onLoginAsGuest,
  onRegisterUser,
  onResetData,
}: AuthModalProps) {
  const [mode, setMode] = useState<'guest' | 'register' | 'switch'>('guest');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regBio, setRegBio] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);
  const [uploadedAvatar, setUploadedAvatar] = useState<string | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Ficção Científica', 'Drama']);
  const [errorMsg, setErrorMsg] = useState('');
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingUpload(true);
      setErrorMsg('');
      const optimizedDataUrl = await processImageFile(file, 300);
      setUploadedAvatar(optimizedDataUrl);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Erro ao carregar a foto de perfil.');
    } finally {
      setIsProcessingUpload(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) {
      setErrorMsg('Por favor, informe o seu nome ou apelido.');
      return;
    }
    setErrorMsg('');
    onRegisterUser({
      name: regName,
      username: regUsername.trim() || regName.toLowerCase().replace(/\s+/g, '_'),
      bio: regBio,
      avatar: uploadedAvatar || selectedAvatar,
      favoriteGenres: selectedGenres,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-[#12121A] p-6 sm:p-8 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.95),0_0_32px_0_rgba(244,63,94,0.2)] my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#F43F5E] to-[#BE185D] text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]">
            <Film className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
              Acesso ao CineLumina
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Entre como visitante, crie seu cadastro ou alterne de cinéfilo
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="mb-6 flex rounded-xl border border-white/8 bg-black/40 p-1">
          <button
            type="button"
            onClick={() => setMode('guest')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all ${
              mode === 'guest'
                ? 'bg-[#F43F5E] text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            Entrada de Visitante
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all ${
              mode === 'register'
                ? 'bg-[#F43F5E] text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="h-4 w-4" />
            Criar Cadastro
          </button>
          <button
            type="button"
            onClick={() => setMode('switch')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all ${
              mode === 'switch'
                ? 'bg-[#F43F5E] text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="h-4 w-4" />
            Trocar Usuário
          </button>
        </div>

        {/* Tab 1: Instant Guest Login */}
        {mode === 'guest' && (
          <div className="space-y-6">
            <div className="rounded-xl border border-[#F43F5E]/30 bg-[#F43F5E]/10 p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-6 w-6 text-[#F43F5E] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-white text-sm sm:text-base">
                    Acesso Imediato para Visitantes
                  </h3>
                  <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                    Você pode começar a usar o site agora mesmo sem burocracia. Como visitante, você poderá explorar perfis, cadastrar seus filmes favoritos, editar sua lista e deixar mensagens no mural de outros cinéfilos!
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onLoginAsGuest();
                    onClose();
                  }}
                  className="w-full neon-btn-primary flex items-center justify-center gap-2 rounded-xl py-3 px-6 text-sm font-bold shadow-lg"
                >
                  <Sparkles className="h-4 w-4" />
                  Entrar como Visitante Agora
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-white/8 bg-white/5 p-4 text-xs text-slate-400 flex items-center justify-between">
              <div>
                <span>Usuário atual ativo: </span>
                <span className="font-semibold text-white ml-1">{currentUser.name}</span>
                <span className="text-slate-400 ml-1">(@{currentUser.username})</span>
              </div>
              <button
                type="button"
                onClick={() => setMode('switch')}
                className="text-[#38BDF8] hover:underline"
              >
                Mudar conta
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Register New Profile */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            {errorMsg && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-2.5 text-xs text-red-300">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Seu Nome ou Apelido Cinéfilo *
              </label>
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Ex: Pedro Almodóvar, Ana Cineasta..."
                className="w-full rounded-lg border border-white/10 bg-black/60 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#F43F5E] focus:outline-none focus:ring-1 focus:ring-[#F43F5E]"
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
                  onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="seu_usuario"
                  className="w-full rounded-lg border border-white/10 bg-black/60 pl-8 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#F43F5E] focus:outline-none focus:ring-1 focus:ring-[#F43F5E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Mini Biografia / Frase que define seu gosto
              </label>
              <textarea
                rows={2}
                value={regBio}
                onChange={(e) => setRegBio(e.target.value)}
                placeholder="Ex: Apaixonado por suspense dos anos 70 e ficção científica moderna."
                className="w-full rounded-lg border border-white/10 bg-black/60 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-[#F43F5E] focus:outline-none focus:ring-1 focus:ring-[#F43F5E] resize-none"
              />
            </div>

            {/* Choose or Upload Avatar */}
            <div className="space-y-3 rounded-2xl border border-white/8 bg-white/3 p-3.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300">
                  Foto de Perfil ou Avatar
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
                id="modal-avatar-upload"
              />

              <div className="flex items-center gap-3">
                <div className="relative h-14 w-14 rounded-full overflow-hidden border-2 border-[#F43F5E] shadow-[0_0_12px_rgba(244,63,94,0.4)] shrink-0 bg-slate-800">
                  <img
                    src={uploadedAvatar || selectedAvatar}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {isProcessingUpload && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#F43F5E] border-t-transparent" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isProcessingUpload}
                      className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/8 px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#F43F5E]/20 hover:border-[#F43F5E] hover:text-[#F43F5E] transition-all"
                    >
                      <Upload className="h-3.5 w-3.5 text-[#FBBF24]" />
                      <span>{uploadedAvatar ? 'Trocar Foto' : 'Fazer Upload de Foto'}</span>
                    </button>

                    {uploadedAvatar && (
                      <button
                        type="button"
                        onClick={() => setUploadedAvatar(null)}
                        className="flex items-center gap-1 rounded-xl border border-red-500/20 bg-red-500/10 px-2 py-1.5 text-xs text-red-400 hover:bg-red-500/20 transition-colors"
                        title="Remover foto enviada"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Remover</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Selecione um arquivo de imagem do seu computador ou celular.
                  </p>
                </div>
              </div>

              {/* Preset Avatars */}
              <div className="pt-2 border-t border-white/5">
                <span className="block text-[11px] text-slate-400 mb-2">
                  Ou escolha um avatar cinéfilo:
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                  {PRESET_AVATARS.map((url, i) => {
                    const isSelected = !uploadedAvatar && selectedAvatar === url;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setSelectedAvatar(url);
                          setUploadedAvatar(null);
                        }}
                        className={`relative h-10 w-10 rounded-full overflow-hidden border-2 transition-transform shrink-0 ${
                          isSelected
                            ? 'border-[#F43F5E] scale-110 shadow-[0_0_10px_rgba(244,63,94,0.6)]'
                            : 'border-white/20 opacity-70 hover:opacity-100 hover:scale-105'
                        }`}
                      >
                        <img src={url} alt="Avatar" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                        {isSelected && (
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
              className="w-full mt-4 neon-btn-primary flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-sm font-bold shadow-lg"
            >
              <UserPlus className="h-4 w-4" />
              Finalizar Cadastro & Começar
            </button>
          </form>
        )}

        {/* Tab 3: Switch User / Demo Accounts */}
        {mode === 'switch' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400">
              Selecione qualquer cinéfilo abaixo para testar a experiência de navegar e comentar como usuários diferentes:
            </p>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
              {allUsers.map((user) => {
                const isCurrent = currentUser.id === user.id;
                return (
                  <div
                    key={user.id}
                    onClick={() => {
                      onSwitchUser(user.id);
                      onClose();
                    }}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      isCurrent
                        ? 'border-[#F43F5E] bg-[#F43F5E]/10 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                        : 'border-white/8 bg-white/5 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-10 w-10 rounded-full object-cover border border-white/20"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white text-sm">
                            {user.name}
                          </span>
                          {user.badge && (
                            <span className="text-[10px] text-[#FBBF24] font-meta uppercase tracking-wider">
                              {user.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">@{user.username}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCurrent ? (
                        <span className="flex items-center gap-1 text-xs text-[#F43F5E] font-medium">
                          <UserCheck className="h-4 w-4" />
                          Conectado
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 hover:text-white">
                          Conectar &rarr;
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-white/8 flex items-center justify-between">
              <button
                type="button"
                onClick={onResetData}
                className="text-xs text-slate-500 hover:text-slate-300 underline"
              >
                Restaurar dados iniciais de fábrica
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-xs text-[#F43F5E] hover:underline font-medium"
              >
                + Criar novo perfil
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
