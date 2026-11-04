'use client';

import React, { useState, useRef } from 'react';
import { X, User as UserIcon, Check, Sparkles, Upload, Camera, Trash2 } from 'lucide-react';
import { User } from '@/lib/types';
import { processImageFile } from '@/lib/imageUtils';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpdateProfile: (updatedData: Partial<User>) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=400&q=80',
];

const ALL_GENRES = [
  'Ficção Científica',
  'Drama',
  'Suspense',
  'Ação',
  'Crime',
  'Terror',
  'Animação',
  'Neo-Noir',
  'Romance',
  'Documentário',
];

export function EditProfileModal({
  isOpen,
  onClose,
  currentUser,
  onUpdateProfile,
}: EditProfileModalProps) {
  const [name, setName] = useState(currentUser.name);
  const [username, setUsername] = useState(currentUser.username);
  const [bio, setBio] = useState(currentUser.bio);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [favoriteGenres, setFavoriteGenres] = useState<string[]>(currentUser.favoriteGenres || []);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingUpload(true);
      setUploadError('');
      const optimizedDataUrl = await processImageFile(file, 300);
      setAvatar(optimizedDataUrl);
    } catch (err: any) {
      setUploadError(err?.message || 'Erro ao carregar imagem de perfil.');
    } finally {
      setIsProcessingUpload(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const toggleGenre = (genre: string) => {
    setFavoriteGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onUpdateProfile({
      name: name.trim(),
      username: username.trim().toLowerCase().replace(/[^a-z0-9_]/g, ''),
      bio: bio.trim(),
      avatar: avatar.trim(),
      favoriteGenres,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#12121A] p-6 sm:p-8 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.95)] my-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F43F5E]/20 text-[#F43F5E]">
            <UserIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-white">Editar Perfil Pessoal</h2>
            <p className="text-xs text-slate-400">Atualize sua identidade e preferências cinematográficas</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Nome Completo</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/60 px-3.5 py-2.5 text-sm text-white focus:border-[#F43F5E] focus:outline-none focus:ring-1 focus:ring-[#F43F5E]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Nome de Usuário (@handle)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-500 text-sm">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black/60 pl-8 pr-3.5 py-2.5 text-sm text-white focus:border-[#F43F5E] focus:outline-none focus:ring-1 focus:ring-[#F43F5E]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Biografia Cinéfila</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/60 px-3.5 py-2.5 text-sm text-white focus:border-[#F43F5E] focus:outline-none focus:ring-1 focus:ring-[#F43F5E] resize-none"
            />
          </div>

          {/* Avatar Upload and Presets */}
          <div className="space-y-3 rounded-2xl border border-white/8 bg-white/3 p-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-300">
                Foto de Perfil ou Avatar
              </label>
              {avatar.startsWith('data:image') && (
                <span className="text-[11px] text-[#FBBF24] font-medium flex items-center gap-1">
                  <Check className="h-3 w-3" /> Foto personalizada ativa
                </span>
              )}
            </div>

            {uploadError && (
              <p className="text-xs text-red-400">{uploadError}</p>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="edit-profile-avatar-upload"
            />

            <div className="flex items-center gap-3">
              <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-[#F43F5E] shadow-[0_0_12px_rgba(244,63,94,0.4)] shrink-0 bg-slate-800">
                <img
                  src={avatar}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
                {isProcessingUpload && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#F43F5E] border-t-transparent" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-1.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessingUpload}
                  className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/8 px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#F43F5E]/20 hover:border-[#F43F5E] hover:text-[#F43F5E] transition-all"
                >
                  <Upload className="h-3.5 w-3.5 text-[#FBBF24]" />
                  <span>Fazer Upload de Nova Foto</span>
                </button>
                <p className="text-[11px] text-slate-400">
                  Carregue uma imagem do seu computador ou celular.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5">
              <span className="block text-[11px] text-slate-400 mb-2">
                Ou escolha um dos avatares da comunidade:
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                {PRESET_AVATARS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAvatar(url)}
                    className={`relative h-11 w-11 rounded-full overflow-hidden border-2 shrink-0 transition-transform ${
                      avatar === url
                        ? 'border-[#F43F5E] scale-110 shadow-[0_0_10px_rgba(244,63,94,0.6)]'
                        : 'border-white/15 opacity-70 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    <img src={url} alt="Avatar" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    {avatar === url && (
                      <div className="absolute inset-0 bg-[#F43F5E]/30 flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Gêneros Favoritos</label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_GENRES.map((genre) => {
                const isSelected = favoriteGenres.includes(genre);
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

          <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-white/8">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="neon-btn-primary flex items-center gap-2 rounded-xl py-2.5 px-5 text-sm font-bold shadow-md"
            >
              <Check className="h-4 w-4" />
              Salvar Perfil
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
