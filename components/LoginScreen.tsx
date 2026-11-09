'use client';

import React, { useState, useRef } from 'react';
import { Film, Sparkles, UserPlus, LogIn, Check, ShieldCheck, ArrowRight, Star, Upload, Trash2, Database, Mail, Lock, Eye, EyeOff, KeyRound } from 'lucide-react';
import { User, Movie } from '@/lib/types';
import { processImageFile } from '@/lib/imageUtils';
import { getSupabaseCredentials } from '@/lib/supabase';

interface LoginScreenProps {
  allUsers: User[];
  allMovies: Movie[];
  onLoginAsGuest: () => void;
  onRegisterUser?: (userData: {
    name: string;
    username: string;
    bio: string;
    avatar?: string;
    favoriteGenres: string[];
  }) => void;
  onRegisterWithEmail?: (
    email: string,
    password?: string,
    userData?: {
      name: string;
      username: string;
      bio: string;
      avatar?: string;
      favoriteGenres: string[];
    }
  ) => Promise<any> | void;
  onLoginWithEmail?: (identifier: string, password?: string) => Promise<any> | void;
  onSelectExistingUser: (userId: string) => void;
  onSelectExistingUserWithPassword?: (userId: string, password?: string) => Promise<any> | boolean;
  onOpenSupabaseConfig?: () => void;
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
  onRegisterWithEmail,
  onLoginWithEmail,
  onSelectExistingUser,
  onSelectExistingUserWithPassword,
  onOpenSupabaseConfig,
}: LoginScreenProps) {
  // Tabs: 'register' (Novo Cadastro) | 'login' (Entrar com Conta) | 'guest' (Entrar como Visitante)
  const [activeTab, setActiveTab] = useState<'register' | 'login' | 'guest'>('register');

  // Register state
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regBio, setRegBio] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);
  const [uploadedAvatar, setUploadedAvatar] = useState<string | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Ficção Científica', 'Drama']);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);

  // Login with email state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginErrorMessage, setLoginErrorMessage] = useState('');
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);

  // Existing profile selection password state
  const [existingPassword, setExistingPassword] = useState('');
  const [showExistingPassword, setShowExistingPassword] = useState(false);
  const [existingPasswordError, setExistingPasswordError] = useState('');

  // Supabase connection status check
  const [supabaseStatus] = useState<{ isConfigured: boolean; url: string }>(() => {
    const creds = getSupabaseCredentials();
    return {
      isConfigured: creds.isConfigured,
      url: creds.url,
    };
  });

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

  // Submit registration with Email and password
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regEmail.trim()) {
      setErrorMessage('Por favor, informe seu e-mail para cadastro.');
      return;
    }
    if (!regEmail.includes('@') || !regEmail.includes('.')) {
      setErrorMessage('Por favor, digite um e-mail válido.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setErrorMessage('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (!regName.trim()) {
      setErrorMessage('Por favor, informe seu nome ou apelido para o perfil.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      const cleanUsername = regUsername.trim() || regName.toLowerCase().replace(/\s+/g, '_');
      const avatarToUse = uploadedAvatar || selectedAvatar;

      if (onRegisterWithEmail) {
        await onRegisterWithEmail(regEmail.trim(), regPassword, {
          name: regName.trim(),
          username: cleanUsername,
          bio: regBio.trim(),
          avatar: avatarToUse,
          favoriteGenres: selectedGenres,
        });
      } else if (onRegisterUser) {
        onRegisterUser({
          name: regName.trim(),
          username: cleanUsername,
          bio: regBio.trim(),
          avatar: avatarToUse,
          favoriteGenres: selectedGenres,
        });
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Erro ao realizar cadastro.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit email/password login
  const handleEmailLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanLoginId = loginEmail.trim();
    const cleanPass = loginPassword ? loginPassword.trim() : '';

    if (!cleanLoginId) {
      setLoginErrorMessage('Por favor, informe seu e-mail ou nome de usuário.');
      return;
    }
    if (!cleanPass) {
      setLoginErrorMessage('Por favor, informe a senha de acesso.');
      return;
    }

    try {
      setIsLoginSubmitting(true);
      setLoginErrorMessage('');

      if (onLoginWithEmail) {
        await onLoginWithEmail(cleanLoginId, cleanPass);
      } else {
        // Fallback to match user in allUsers with strict password verification
        const matched = allUsers.find(
          (u) =>
            u.email?.toLowerCase() === cleanLoginId.toLowerCase() ||
            u.username.toLowerCase() === cleanLoginId.toLowerCase()
        );
        if (!matched) {
          throw new Error('Nenhuma conta encontrada com este e-mail ou usuário.');
        }
        if (!matched.isGuest) {
          const expected = matched.password || '123456';
          if (cleanPass !== expected) {
            throw new Error(`Senha incorreta para a conta @${matched.username}. Tente novamente.`);
          }
        }
        if (onSelectExistingUserWithPassword) {
          await onSelectExistingUserWithPassword(matched.id, cleanPass);
        } else {
          onSelectExistingUser(matched.id);
        }
      }
    } catch (err: any) {
      setLoginErrorMessage(err?.message || 'E-mail ou senha inválidos.');
    } finally {
      setIsLoginSubmitting(false);
    }
  };

  const handleExistingLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetUser = allUsers.find((u) => u.id === selectedExistingId);
    if (!targetUser) return;

    setExistingPasswordError('');

    // If guest, allow immediate login
    if (targetUser.isGuest) {
      onSelectExistingUser(targetUser.id);
      return;
    }

    const cleanPass = existingPassword ? existingPassword.trim() : '';
    const expectedPassword = targetUser.password || '123456';

    // Require password for selected profile
    if (!cleanPass) {
      setExistingPasswordError(`Por favor, digite a senha de acesso para o perfil de ${targetUser.name}.`);
      return;
    }

    // Validate password strictly
    if (cleanPass !== expectedPassword) {
      setExistingPasswordError(`Senha incorreta para @${targetUser.username}. Tente novamente.`);
      return;
    }

    try {
      if (onSelectExistingUserWithPassword) {
        await onSelectExistingUserWithPassword(targetUser.id, cleanPass);
      } else if (onLoginWithEmail) {
        await onLoginWithEmail(targetUser.email || targetUser.username, cleanPass);
      } else {
        onSelectExistingUser(targetUser.id);
      }
    } catch (err: any) {
      setExistingPasswordError(err?.message || 'Erro ao validar senha.');
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
        {/* Supabase Status Pill Bar */}
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onOpenSupabaseConfig}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold transition-all border ${
              supabaseStatus.isConfigured
                ? 'border-[#3ECF8E]/40 bg-[#3ECF8E]/10 text-[#3ECF8E] hover:bg-[#3ECF8E]/20'
                : 'border-[#38BDF8]/40 bg-[#38BDF8]/10 text-[#38BDF8] hover:bg-[#38BDF8]/20'
            }`}
            title="Clique para ver variáveis de conexão do Supabase"
          >
            <Database className="h-3 w-3" />
            <span>
              {supabaseStatus.isConfigured
                ? 'Supabase Conectado'
                : 'Supabase: Ver Variáveis de Conexão'}
            </span>
          </button>

          <span className="text-[11px] text-slate-500 font-mono">
            {supabaseStatus.isConfigured ? 'Auth Remoto Ativo' : 'Auth Híbrido'}
          </span>
        </div>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F43F5E] via-[#E11D48] to-[#9F1239] text-white shadow-[0_0_24px_rgba(244,63,94,0.5)] mb-3">
            <Film className="h-7 w-7" />
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            CineLumina
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300">
            Rede social para cinéfilos. Cadastre-se por e-mail, organize seus filmes favoritos e interaja na comunidade.
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
            <span>Entrar / Login</span>
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

        {/* TAB 1: NOVO CADASTRO COM E-MAIL E SENHA */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {errorMessage && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-2.5 text-xs text-red-300">
                {errorMessage}
              </div>
            )}

            {/* Email & Senha fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-[#F43F5E]" />
                  <span>E-mail *</span>
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#F43F5E] focus:outline-none focus:ring-1 focus:ring-[#F43F5E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-[#F43F5E]" />
                  <span>Senha * (mín. 6)</span>
                </label>
                <div className="relative">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Sua senha secreta"
                    className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#F43F5E] focus:outline-none focus:ring-1 focus:ring-[#F43F5E]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Nome e Handle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome Completo ou Apelido *
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Ex: Matheus Silva"
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
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Biografia / Frase Cinematográfica
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
              disabled={isSubmitting}
              className="w-full mt-2 neon-btn-primary flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-sm font-bold shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>Cadastrar com E-mail & Entrar</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 2: ENTRAR COM E-MAIL OU SELECIONAR CONTA */}
        {activeTab === 'login' && (
          <div className="space-y-6">
            {/* Direct Email/Password Login Form */}
            <form onSubmit={handleEmailLoginSubmit} className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-meta">
                  Entrar com E-mail e Senha
                </span>
                <span className="text-[11px] text-[#38BDF8]">
                  Supabase Auth
                </span>
              </div>

              {loginErrorMessage && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-2.5 text-xs text-red-300">
                  {loginErrorMessage}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  E-mail ou Usuário
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="lucas@cinelumina.com ou seu@email.com"
                    className="w-full rounded-xl border border-white/10 bg-black/60 pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#F43F5E] focus:outline-none focus:ring-1 focus:ring-[#F43F5E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Sua senha"
                    className="w-full rounded-xl border border-white/10 bg-black/60 pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#F43F5E] focus:outline-none focus:ring-1 focus:ring-[#F43F5E]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoginSubmitting}
                className="w-full neon-btn-primary flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-sm font-bold shadow-lg disabled:opacity-50"
              >
                {isLoginSubmitting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    <span>Entrar na Minha Conta</span>
                  </>
                )}
              </button>
            </form>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink mx-4 text-[11px] text-slate-500 uppercase tracking-widest">
                Ou selecione uma conta da comunidade
              </span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            {/* Quick Switcher of Registered Profiles */}
            <form onSubmit={handleExistingLogin} className="space-y-3">
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                {allUsers.map((user) => {
                  const isSelected = selectedExistingId === user.id;
                  return (
                    <div
                      key={user.id}
                      onClick={() => {
                        setSelectedExistingId(user.id);
                        setExistingPassword('');
                        setExistingPasswordError('');
                        if (user.email) setLoginEmail(user.email);
                      }}
                      className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#F43F5E] bg-[#F43F5E]/15 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                          : 'border-white/8 bg-white/5 hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="h-9 w-9 rounded-full object-cover border border-white/20 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="text-left">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-white text-xs">{user.name}</span>
                            {user.badge && (
                              <span className="text-[9px] text-[#FBBF24] font-meta uppercase tracking-wider">
                                {user.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400">
                            {user.email || `@${user.username}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isSelected ? (
                          <div className="h-5 w-5 rounded-full bg-[#F43F5E] flex items-center justify-center text-white">
                            <Check className="h-3 w-3" />
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500">Selecionar</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Password prompt for selected profile */}
              {(() => {
                const targetUser = allUsers.find((u) => u.id === selectedExistingId);
                if (!targetUser) return null;
                if (targetUser.isGuest) {
                  return (
                    <button
                      type="submit"
                      className="w-full neon-btn-primary flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold shadow-md"
                    >
                      <Sparkles className="h-4 w-4 text-[#FBBF24]" />
                      <span>Entrar como {targetUser.name}</span>
                    </button>
                  );
                }
                return (
                  <div className="rounded-2xl border border-white/12 bg-white/5 p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                        <Lock className="h-3.5 w-3.5 text-[#F43F5E]" />
                        <span>Senha de acesso para {targetUser.name}:</span>
                      </label>
                      {targetUser.password === '123456' && (
                        <span className="text-[10px] text-[#FBBF24] font-mono bg-[#FBBF24]/10 px-2 py-0.5 rounded border border-[#FBBF24]/20">
                          Senha teste: 123456
                        </span>
                      )}
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                      <input
                        type={showExistingPassword ? 'text' : 'password'}
                        required
                        value={existingPassword}
                        onChange={(e) => {
                          setExistingPassword(e.target.value);
                          setExistingPasswordError('');
                        }}
                        placeholder={`Digite a senha de @${targetUser.username}`}
                        className="w-full rounded-xl border border-white/10 bg-black/60 pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-[#F43F5E] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowExistingPassword(!showExistingPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                      >
                        {showExistingPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    {existingPasswordError && (
                      <p className="text-xs text-red-400 font-medium">{existingPasswordError}</p>
                    )}

                    <button
                      type="submit"
                      className="w-full neon-btn-primary flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-bold shadow-md"
                    >
                      <KeyRound className="h-3.5 w-3.5 text-[#FBBF24]" />
                      <span>Confirmar Senha & Acessar Perfil</span>
                    </button>
                  </div>
                );
              })()}
            </form>
          </div>
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
              <span>Você poderá criar uma conta com seu próprio e-mail a qualquer momento!</span>
            </div>
          </div>
        )}

        {/* Bottom Switcher Note & Supabase Config link */}
        <div className="mt-6 pt-5 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <button
            type="button"
            onClick={onOpenSupabaseConfig}
            className="text-slate-400 hover:text-[#38BDF8] flex items-center gap-1.5 transition-colors"
          >
            <Database className="h-3.5 w-3.5 text-[#3ECF8E]" />
            <span>Configurar Conexão Supabase</span>
          </button>

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
