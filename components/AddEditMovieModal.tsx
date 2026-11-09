'use client';

import React, { useState, useRef } from 'react';
import { X, Film, Star, Sparkles, Check, Upload, Link2, Trash2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Movie, MoviePreset } from '@/lib/types';
import { MOVIE_PRESETS } from '@/lib/initialData';
import { processMoviePosterFile } from '@/lib/imageUtils';

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

const DEFAULT_POSTER =
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80';

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
  const [duration, setDuration] = useState(movieToEdit?.duration || '2h 15m');
  const [selectedTag, setSelectedTag] = useState(movieToEdit?.tags?.[0] || 'Obra-prima');
  const [selectedTech, setSelectedTech] = useState(movieToEdit?.techSpecs?.[0] || '4K HDR');

  // Poster states: File upload vs URL
  const initialIsDataUrl = Boolean(movieToEdit?.posterUrl?.startsWith('data:image'));
  const [posterMode, setPosterMode] = useState<'upload' | 'url'>(initialIsDataUrl ? 'upload' : 'url');
  const [posterUrl, setPosterUrl] = useState(!initialIsDataUrl ? (movieToEdit?.posterUrl || '') : '');
  const [uploadedPoster, setUploadedPoster] = useState<string | null>(initialIsDataUrl ? (movieToEdit?.posterUrl || null) : null);
  const [isUploadingPoster, setIsUploadingPoster] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: MoviePreset) => {
    setTitle(preset.title);
    setDirector(preset.director);
    setYear(preset.year);
    setGenre(preset.genre);
    setPosterUrl(preset.posterUrl);
    setUploadedPoster(null);
    setPosterMode('url');
    setDuration(preset.duration);
    if (!userReview) {
      setUserReview(preset.defaultReview);
    }
    if (preset.techSpecs[0]) {
      setSelectedTech(preset.techSpecs[0]);
    }
  };

  const handlePosterFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingPoster(true);
      setUploadError('');
      const optimizedPoster = await processMoviePosterFile(file, 400, 600);
      setUploadedPoster(optimizedPoster);
      setPosterMode('upload');
    } catch (err: any) {
      setUploadError(err?.message || 'Erro ao carregar e recortar o arquivo do pôster.');
    } finally {
      setIsUploadingPoster(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveUploadedPoster = () => {
    setUploadedPoster(null);
  };

  // Preview target image URL
  const currentPosterPreview =
    posterMode === 'upload'
      ? uploadedPoster
      : (posterUrl.trim() || null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Use uploaded poster if in upload mode or if available; otherwise use typed URL or fallback
    let finalPoster = DEFAULT_POSTER;
    if (posterMode === 'upload' && uploadedPoster) {
      finalPoster = uploadedPoster;
    } else if (posterUrl.trim()) {
      finalPoster = posterUrl.trim();
    } else if (uploadedPoster) {
      finalPoster = uploadedPoster;
    }

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
                : 'Adicione uma obra especial à sua galeria de cinema com pôster e resenha'}
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

          {/* User Review / Quote */}
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

          {/* ======================================================== */}
          {/* PÔSTER DO FILME: OPÇÕES DE UPLOAD OU URL DA WEB         */}
          {/* ======================================================== */}
          <div className="rounded-2xl border border-white/10 bg-white/3 p-4 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="block text-xs font-semibold text-white">
                  Pôster do Filme
                </label>
                <p className="text-[11px] text-slate-400">
                  Envie um arquivo do seu dispositivo ou informe um link direto da web
                </p>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex rounded-xl border border-white/10 bg-black/60 p-1 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setPosterMode('upload')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    posterMode === 'upload'
                      ? 'bg-[#F43F5E] text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Fazer Upload</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPosterMode('url')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    posterMode === 'url'
                      ? 'bg-[#F43F5E] text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Link2 className="h-3.5 w-3.5" />
                  <span>URL / Link</span>
                </button>
              </div>
            </div>

            {uploadError && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-2 text-xs text-red-300 flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePosterFileUpload}
              className="hidden"
              id="movie-poster-file-input"
            />

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Live 2:3 Cinematic Poster Preview Thumbnail */}
              <div className="relative h-28 w-20 rounded-xl overflow-hidden border-2 border-white/15 bg-black/70 shrink-0 shadow-[0_0_15px_rgba(0,0,0,0.8)]">
                {currentPosterPreview ? (
                  <img
                    src={currentPosterPreview}
                    alt="Pré-visualização do pôster"
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center p-2 text-center text-slate-500">
                    <ImageIcon className="h-6 w-6 mb-1 opacity-50" />
                    <span className="text-[9px] leading-tight">Padrão</span>
                  </div>
                )}

                {isUploadingPoster && (
                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#F43F5E] border-t-transparent" />
                  </div>
                )}
              </div>

              {/* Dynamic Content based on selected mode */}
              <div className="flex-1 w-full space-y-2">
                {/* 1. UPLOAD MODE */}
                {posterMode === 'upload' && (
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingPoster}
                        className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/8 px-4 py-2 text-xs font-semibold text-white hover:bg-[#F43F5E]/20 hover:border-[#F43F5E] hover:text-[#F43F5E] transition-all"
                      >
                        <Upload className="h-3.5 w-3.5 text-[#FBBF24]" />
                        <span>{uploadedPoster ? 'Trocar Arquivo do Pôster' : 'Selecionar Imagem do Computador/Celular'}</span>
                      </button>

                      {uploadedPoster && (
                        <button
                          type="button"
                          onClick={handleRemoveUploadedPoster}
                          className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400 hover:bg-red-500/20 transition-colors"
                          title="Remover pôster enviado"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Remover</span>
                        </button>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400">
                      Formatos aceitos: JPG, PNG ou WEBP. A imagem será recortada automaticamente na proporção 2:3 padrão de cinema.
                    </p>

                    {uploadedPoster && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#3ECF8E] font-medium">
                        <Check className="h-3 w-3" /> Pôster em alta qualidade carregado com sucesso!
                      </span>
                    )}
                  </div>
                )}

                {/* 2. URL LINK MODE */}
                {posterMode === 'url' && (
                  <div className="space-y-1.5">
                    <div className="relative">
                      <Link2 className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                      <input
                        type="url"
                        value={posterUrl}
                        onChange={(e) => setPosterUrl(e.target.value)}
                        placeholder="https://exemplo.com/poster-do-filme.jpg"
                        className="w-full rounded-xl border border-white/10 bg-black/60 pl-10 pr-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-[#F43F5E] focus:outline-none focus:ring-1 focus:ring-[#F43F5E]"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Cole um link direto para a imagem do pôster. Se deixar em branco, usará uma arte cinematográfica padrão.
                    </p>
                  </div>
                )}
              </div>
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
              disabled={isUploadingPoster}
              className="neon-btn-primary flex items-center gap-2 rounded-xl py-2.5 px-6 text-sm font-bold shadow-lg disabled:opacity-50"
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
