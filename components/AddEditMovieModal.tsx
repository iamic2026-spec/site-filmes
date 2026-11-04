'use client';

import React, { useState, useEffect } from 'react';
import { X, Film, Star, Sparkles, Check, Image as ImageIcon } from 'lucide-react';
import { Movie, MoviePreset } from '@/lib/types';
import { MOVIE_PRESETS } from '@/lib/initialData';

interface AddEditMovieModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveMovie: (movieData: Omit<Movie, 'id' | 'userId' | 'createdAt' | 'likesCount'>) => void;
  onUpdateMovie?: (movieId: string, updatedFields: Partial<Movie>) => void;
  movieToEdit?: Movie | null;
}

const GENRE_OPTIONS = [
  'Ficção Científica',
  'Drama',
  'Suspense',
  'Ação',
  'Crime',
  'Terror',
  'Animação',
  'Romance',
  'Mistério',
  'Aventura',
  'Documentário',
  'Comédia',
];

export function AddEditMovieModal({
  isOpen,
  onClose,
  onSaveMovie,
  onUpdateMovie,
  movieToEdit,
}: AddEditMovieModalProps) {
  const isEditing = Boolean(movieToEdit);

  const [title, setTitle] = useState(movieToEdit?.title || '');
  const [director, setDirector] = useState(movieToEdit?.director || '');
  const [year, setYear] = useState<number>(movieToEdit?.year || 2024);
  const [genre, setGenre] = useState(movieToEdit?.genre || 'Ficção Científica');
  const [rating, setRating] = useState<number>(movieToEdit?.rating || 9.5);
  const [userReview, setUserReview] = useState(movieToEdit?.userReview || '');
  const [posterUrl, setPosterUrl] = useState(movieToEdit?.posterUrl || '');
  const [duration, setDuration] = useState(movieToEdit?.duration || '2h 15m');
  const [selectedTag, setSelectedTag] = useState(movieToEdit?.tags?.[0] || 'Obra-prima');
  const [selectedTech, setSelectedTech] = useState(movieToEdit?.techSpecs?.[0] || '4K HDR');

  if (!isOpen) return null;

  const handleApplyPreset = (preset: MoviePreset) => {
    setTitle(preset.title);
    setDirector(preset.director);
    setYear(preset.year);
    setGenre(preset.genre);
    setPosterUrl(preset.posterUrl);
    setDuration(preset.duration);
    if (!userReview) {
      setUserReview(preset.defaultReview);
    }
    if (preset.techSpecs[0]) {
      setSelectedTech(preset.techSpecs[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalPoster =
      posterUrl.trim() ||
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80';

    const moviePayload = {
      title: title.trim(),
      director: director.trim() || 'Diretor Não Informado',
      year: Number(year) || 2024,
      genre: genre || 'Geral',
      rating: Number(rating),
      userReview: userReview.trim() || 'Filme favorito da minha coleção.',
      posterUrl: finalPoster,
      duration: duration.trim() || '2h 00m',
      techSpecs: [selectedTech],
      tags: [selectedTag],
    };

    if (isEditing && movieToEdit && onUpdateMovie) {
      onUpdateMovie(movieToEdit.id, moviePayload);
    } else {
      onSaveMovie(moviePayload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-[#12121A] p-6 sm:p-8 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.95),0_0_32px_0_rgba(244,63,94,0.2)] my-8">
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
              {isEditing ? 'Editar Filme Favorito' : 'Cadastrar Filme Favorito'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              {isEditing
                ? 'Atualize os dados e sua crítica pessoal sobre a obra'
                : 'Adicione uma obra especial à sua galeria de cinema'}
            </p>
          </div>
        </div>

        {/* Quick Presets (Only when adding new movie) */}
        {!isEditing && (
          <div className="mb-6 rounded-xl border border-white/8 bg-black/40 p-4">
            <div className="flex items-center gap-2 mb-2.5">
              <Sparkles className="h-4 w-4 text-[#FBBF24]" />
              <span className="text-xs font-semibold text-slate-200">
                Escolha Rápida de Clássicos (1 clique preenche tudo)
              </span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
              {MOVIE_PRESETS.map((preset) => (
                <button
                  key={preset.title}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs border transition-all whitespace-nowrap shrink-0 ${
                    title === preset.title
                      ? 'border-[#F43F5E] bg-[#F43F5E]/20 text-white font-medium'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <span>{preset.title}</span>
                  <span className="text-[10px] text-slate-400">({preset.year})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Título do Filme *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Interestelar, Pulp Fiction..."
                className="w-full rounded-lg border border-white/10 bg-black/60 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#F43F5E] focus:outline-none focus:ring-1 focus:ring-[#F43F5E]"
              />
            </div>

            {/* Director */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Diretor(a) *
              </label>
              <input
                type="text"
                required
                value={director}
                onChange={(e) => setDirector(e.target.value)}
                placeholder="Ex: Christopher Nolan, Denis Villeneuve..."
                className="w-full rounded-lg border border-white/10 bg-black/60 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#F43F5E] focus:outline-none focus:ring-1 focus:ring-[#F43F5E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Year */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Ano de Lançamento
              </label>
              <input
                type="number"
                min={1895}
                max={2030}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full rounded-lg border border-white/10 bg-black/60 px-3.5 py-2.5 text-sm text-white tabular-nums font-mono focus:border-[#F43F5E] focus:outline-none focus:ring-1 focus:ring-[#F43F5E]"
              />
            </div>

            {/* Genre */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Gênero Principal
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black/60 px-3.5 py-2.5 text-sm text-white focus:border-[#F43F5E] focus:outline-none focus:ring-1 focus:ring-[#F43F5E]"
              >
                {GENRE_OPTIONS.map((g) => (
                  <option key={g} value={g} className="bg-[#12121A] text-white">
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Duração
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Ex: 2h 29m"
                className="w-full rounded-lg border border-white/10 bg-black/60 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#F43F5E] focus:outline-none focus:ring-1 focus:ring-[#F43F5E]"
              />
            </div>
          </div>

          {/* Rating Slider (1.0 to 10.0) */}
          <div className="rounded-xl border border-white/8 bg-black/40 p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Star className="h-4 w-4 text-[#FBBF24] fill-[#FBBF24]" />
                Sua Nota Pessoal
              </label>
              <span className="font-mono text-base font-bold text-[#FBBF24]">
                {Number(rating).toFixed(1)} / 10
              </span>
            </div>
            <input
              type="range"
              min="1.0"
              max="10.0"
              step="0.1"
              value={rating}
              onChange={(e) => setRating(parseFloat(e.target.value))}
              className="w-full accent-[#F43F5E] cursor-pointer"
            />
          </div>

          {/* User Review / Quote (Key requirement from user prompt) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Uma Palavra ou Frase Sobre Este Filme Favorito *
            </label>
            <textarea
              required
              rows={3}
              value={userReview}
              onChange={(e) => setUserReview(e.target.value)}
              placeholder="Ex: 'Uma obra-prima visual que me marcou para sempre pela intensidade do roteiro e trilha sonora inesquecível.'"
              className="w-full rounded-lg border border-white/10 bg-black/60 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#F43F5E] focus:outline-none focus:ring-1 focus:ring-[#F43F5E] resize-none"
            />
          </div>

          {/* Poster Image URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span>URL do Pôster (Opcional - link de imagem)</span>
              <span className="text-[11px] text-slate-500">Se deixar vazio, usará arte padrão</span>
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
                placeholder="https://exemplo.com/poster.jpg"
                className="w-full rounded-lg border border-white/10 bg-black/60 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-[#F43F5E] focus:outline-none focus:ring-1 focus:ring-[#F43F5E]"
              />
            </div>
          </div>

          {/* Tags & Tech Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Destaque / Categoria
              </label>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-xs text-white focus:border-[#F43F5E] focus:outline-none"
              >
                <option value="Obra-prima">Obra-prima</option>
                <option value="Cult Inesquecível">Cult Inesquecível</option>
                <option value="Trilha Sonora Épica">Trilha Sonora Épica</option>
                <option value="Visual Hipnótico">Visual Hipnótico</option>
                <option value="Roteiro Perfeito">Roteiro Perfeito</option>
                <option value="Reviravolta Chocante">Reviravolta Chocante</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Formato de Exibição
              </label>
              <select
                value={selectedTech}
                onChange={(e) => setSelectedTech(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-xs text-white focus:border-[#F43F5E] focus:outline-none"
              >
                <option value="IMAX 70MM">IMAX 70MM</option>
                <option value="4K HDR">4K HDR</option>
                <option value="DOLBY VISION">DOLBY VISION</option>
                <option value="DOLBY ATMOS">DOLBY ATMOS</option>
                <option value="35MM ANALÓGICO">35MM ANALÓGICO</option>
              </select>
            </div>
          </div>

          {/* Submit Action */}
          <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-white/8">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="neon-btn-primary flex items-center gap-2 rounded-xl py-2.5 px-6 text-sm font-bold shadow-lg"
            >
              <Check className="h-4 w-4" />
              {isEditing ? 'Salvar Alterações' : 'Cadastrar aos Favoritos'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
