'use client';

import React, { useState, useMemo } from 'react';
import { useMovieSocial } from '@/hooks/useMovieSocial';
import { Navbar } from '@/components/Navbar';
import { HeroBanner } from '@/components/HeroBanner';
import { UserProfileHeader } from '@/components/UserProfileHeader';
import { MovieCard } from '@/components/MovieCard';
import { AddEditMovieModal } from '@/components/AddEditMovieModal';
import { EditProfileModal } from '@/components/EditProfileModal';
import { MovieDetailsModal } from '@/components/MovieDetailsModal';
import { GuestbookComments } from '@/components/GuestbookComments';
import { CommunityProfiles } from '@/components/CommunityProfiles';
import { AuthModal } from '@/components/AuthModal';
import { LoginScreen } from '@/components/LoginScreen';
import { SupabaseConfigModal } from '@/components/SupabaseConfigModal';
import { ToastNotification } from '@/components/ToastNotification';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { Movie } from '@/lib/types';
import { Film, Search, Plus, Filter, Sparkles, MessageSquare, Database } from 'lucide-react';

export default function HomePage() {
  const {
    isLoaded,
    isAuthenticated,
    users,
    currentUser,
    viewingUser,
    isViewingOwnProfile,
    movies,
    viewingUserMovies,
    viewingUserComments,
    followedUserIds,
    toastMessage,
    // Actions
    visitProfile,
    switchUser,
    loginAsGuest,
    registerUser,
    registerWithEmail,
    loginWithEmail,
    logout,
    updateProfile,
    toggleFollowUser,
    addMovie,
    editMovie,
    deleteMovie,
    likeMovie,
    addComment,
    toggleLikeComment,
    deleteComment,
    deleteUserProfile,
    switchUserWithPassword,
    resetToDefault,
  } = useMovieSocial();

  // Active Main Tab: 'movies' | 'guestbook' | 'community'
  const [activeTab, setActiveTab] = useState<'movies' | 'guestbook' | 'community'>('movies');

  // Modals state
  const [isAddMovieModalOpen, setIsAddMovieModalOpen] = useState(false);
  const [movieToEdit, setMovieToEdit] = useState<Movie | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [selectedMovieForDetails, setSelectedMovieForDetails] = useState<Movie | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSupabaseConfigOpen, setIsSupabaseConfigOpen] = useState(false);

  // Filter & Search inside movies tab
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenreFilter, setSelectedGenreFilter] = useState('Todos');
  const [sortBy, setSortBy] = useState<'rating' | 'year' | 'recent'>('rating');

  // Extract unique genres from viewing user's movies
  const availableGenres = useMemo(() => {
    const genres = new Set<string>();
    viewingUserMovies.forEach((m) => {
      if (m.genre) genres.add(m.genre);
    });
    return ['Todos', ...Array.from(genres)];
  }, [viewingUserMovies]);

  // Filtered and sorted movies
  const filteredMovies = useMemo(() => {
    return viewingUserMovies
      .filter((movie) => {
        const matchesSearch =
          movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          movie.director.toLowerCase().includes(searchQuery.toLowerCase()) ||
          movie.userReview?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesGenre =
          selectedGenreFilter === 'Todos' || movie.genre === selectedGenreFilter;

        return matchesSearch && matchesGenre;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'year') return b.year - a.year;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [viewingUserMovies, searchQuery, selectedGenreFilter, sortBy]);

  // Current user's own movies count for mobile navigation
  const currentUserMovies = useMemo(() => {
    return movies.filter((m) => m.userId === currentUser.id);
  }, [movies, currentUser.id]);

  // Handle open edit
  const handleOpenEditMovie = (movie: Movie) => {
    setMovieToEdit(movie);
    setIsAddMovieModalOpen(true);
  };

  // Handle open add
  const handleOpenAddMovie = () => {
    setMovieToEdit(null);
    setIsAddMovieModalOpen(true);
  };

  // Handle comment directly on movie
  const handleCommentOnMovieFromCard = (movieTitle: string) => {
    setActiveTab('guestbook');
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  if (!isLoaded) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0A0A0E] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#F43F5E] border-t-transparent" />
          <span className="font-display text-sm tracking-wider text-slate-400">
            Carregando CineLumina...
          </span>
        </div>
      </div>
    );
  }

  // Initial screen requires login or guest entry as requested
  if (!isAuthenticated) {
    return (
      <>
        <LoginScreen
          allUsers={users}
          allMovies={movies}
          onLoginAsGuest={loginAsGuest}
          onRegisterUser={registerUser}
          onRegisterWithEmail={registerWithEmail}
          onLoginWithEmail={loginWithEmail}
          onSelectExistingUser={switchUser}
          onSelectExistingUserWithPassword={switchUserWithPassword}
          onOpenSupabaseConfig={() => setIsSupabaseConfigOpen(true)}
        />
        <SupabaseConfigModal
          key={isSupabaseConfigOpen ? 'config-open' : 'config-closed'}
          isOpen={isSupabaseConfigOpen}
          onClose={() => setIsSupabaseConfigOpen(false)}
        />
        <ToastNotification toast={toastMessage} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0E] text-[#F8FAFC] flex flex-col justify-between selection:bg-[#F43F5E] selection:text-white">
      {/* Top Bar Contract Navigation */}
      <Navbar
        currentUser={currentUser}
        viewingUser={viewingUser}
        isViewingOwnProfile={isViewingOwnProfile}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddMovie={handleOpenAddMovie}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onGoToMyProfile={() => visitProfile(currentUser.id)}
        onOpenCommunity={() => setActiveTab('community')}
        onResetData={resetToDefault}
        onLogout={logout}
        onOpenSupabaseConfig={() => setIsSupabaseConfigOpen(true)}
      />

      {/* Main Container */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28 md:pb-8">
        {/* Spotlight Hero Banner (Visible when viewing own profile and on movies tab) */}
        {isViewingOwnProfile && activeTab === 'movies' && (
          <HeroBanner
            currentUser={currentUser}
            totalMovies={viewingUserMovies.length}
            totalCinephiles={users.length}
            featuredMovie={viewingUserMovies[0]}
            onOpenAddMovie={handleOpenAddMovie}
            onOpenCommunity={() => setActiveTab('community')}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {/* User Profile Header (Shows current user's profile or visited user's page) */}
        <UserProfileHeader
          viewingUser={viewingUser}
          currentUser={currentUser}
          isOwner={isViewingOwnProfile}
          movies={viewingUserMovies}
          comments={viewingUserComments}
          isFollowed={followedUserIds.includes(viewingUser.id)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAddMovie={handleOpenAddMovie}
          onOpenEditProfile={() => setIsEditProfileOpen(true)}
          onToggleFollow={toggleFollowUser}
          onGoBackToMyProfile={() => visitProfile(currentUser.id)}
          onLogout={logout}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onDeleteProfile={deleteUserProfile}
        />

        {/* Tab 1: Favorite Movies Gallery */}
        {activeTab === 'movies' && (
          <section className="space-y-6">
            {/* Filter & Search Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl border border-white/8 bg-[#12121A] p-4">
              {/* Search input */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar por título, diretor ou frase..."
                  className="w-full rounded-xl border border-white/10 bg-black/50 pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-[#F43F5E] focus:outline-none"
                />
              </div>

              {/* Filter by Genre and Sort Controls (§1.A buttons) */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Genre Filter Buttons */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full custom-scrollbar">
                  {availableGenres.map((genre) => (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => setSelectedGenreFilter(genre)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                        selectedGenreFilter === genre
                          ? 'bg-[#F43F5E] text-white shadow-sm'
                          : 'bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>

                <div className="h-5 w-px bg-white/10 hidden sm:block" />

                {/* Sort dropdown */}
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Filter className="h-3.5 w-3.5 text-slate-500" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="rounded-lg border border-white/10 bg-black/60 px-2.5 py-1.5 text-xs text-white focus:border-[#F43F5E] focus:outline-none"
                  >
                    <option value="rating">Maior Nota</option>
                    <option value="year">Ano de Lançamento</option>
                    <option value="recent">Adicionados Recentemente</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Movies 2:3 Cards Grid */}
            {filteredMovies.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredMovies.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    isOwner={isViewingOwnProfile}
                    onEdit={handleOpenEditMovie}
                    onDelete={deleteMovie}
                    onLike={likeMovie}
                    onCommentOnMovie={handleCommentOnMovieFromCard}
                    onClickMovie={(m) => setSelectedMovieForDetails(m)}
                  />
                ))}
              </div>
            ) : (
              /* Empty state */
              <div className="rounded-3xl border border-dashed border-white/15 bg-[#12121A]/50 p-12 text-center">
                <Film className="h-12 w-12 text-slate-600 mx-auto mb-3 opacity-60" />
                <h3 className="font-display text-lg font-bold text-white">
                  Nenhum filme encontrado
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                  {searchQuery || selectedGenreFilter !== 'Todos'
                    ? 'Nenhum filme corresponde à sua busca ou filtro atual.'
                    : isViewingOwnProfile
                    ? 'Você ainda não cadastrou nenhum filme favorito na sua lista.'
                    : `${viewingUser.name} ainda não possui filmes cadastrados.`}
                </p>

                {isViewingOwnProfile && (
                  <button
                    type="button"
                    onClick={handleOpenAddMovie}
                    className="mt-5 neon-btn-primary inline-flex items-center gap-2 rounded-xl py-2.5 px-5 text-xs font-bold shadow-md"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Cadastrar Primeiro Filme</span>
                  </button>
                )}
              </div>
            )}
          </section>
        )}

        {/* Tab 2: Profile Guestbook Comments */}
        {activeTab === 'guestbook' && (
          <GuestbookComments
            viewingUser={viewingUser}
            currentUser={currentUser}
            comments={viewingUserComments}
            userMovies={viewingUserMovies}
            onAddComment={addComment}
            onToggleLike={toggleLikeComment}
            onDeleteComment={deleteComment}
            onVisitProfile={visitProfile}
          />
        )}

        {/* Tab 3: Community of Cinephiles */}
        {activeTab === 'community' && (
          <CommunityProfiles
            allUsers={users}
            currentUserId={currentUser.id}
            allMovies={movies}
            followedUserIds={followedUserIds}
            onVisitProfile={(userId) => {
              visitProfile(userId);
              setActiveTab('movies');
            }}
            onToggleFollow={toggleFollowUser}
          />
        )}
      </main>

      {/* Clean Footer (§1.B Anti-Slop no fake telemetry) */}
      <footer className="mt-16 border-t border-white/8 bg-[#0A0A0E] py-8">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-slate-300">CineLumina</span>
            <span aria-hidden="true">·</span>
            <span>Rede social para amantes de cinema</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsSupabaseConfigOpen(true)}
              className="text-[#3ECF8E] hover:underline flex items-center gap-1.5 font-medium"
            >
              <Database className="h-3.5 w-3.5" />
              <span>Conexão Supabase (.env)</span>
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={resetToDefault}
              className="hover:text-slate-300 underline"
            >
              Restaurar dados originais
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={logout}
              className="hover:text-[#F43F5E] transition-colors"
            >
              Sair para Tela de Login
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AddEditMovieModal
        key={movieToEdit ? `edit-${movieToEdit.id}` : (isAddMovieModalOpen ? 'new-movie-open' : 'new-movie-closed')}
        isOpen={isAddMovieModalOpen}
        onClose={() => {
          setIsAddMovieModalOpen(false);
          setMovieToEdit(null);
        }}
        onSaveMovie={addMovie}
        onUpdateMovie={editMovie}
        movieToEdit={movieToEdit}
      />

      <EditProfileModal
        key={isEditProfileOpen ? `edit-profile-${currentUser.id}` : 'edit-profile-closed'}
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        currentUser={currentUser}
        onUpdateProfile={updateProfile}
        onLogout={logout}
        onDeleteProfile={deleteUserProfile}
      />

      <MovieDetailsModal
        movie={selectedMovieForDetails}
        ownerUser={viewingUser}
        currentUser={currentUser}
        comments={viewingUserComments}
        onClose={() => setSelectedMovieForDetails(null)}
        onLikeMovie={likeMovie}
        onAddComment={addComment}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        allUsers={users}
        onSwitchUser={switchUser}
        onSwitchUserWithPassword={switchUserWithPassword}
        onLoginAsGuest={loginAsGuest}
        onRegisterUser={registerUser}
        onResetData={resetToDefault}
        onLogout={logout}
      />

      <SupabaseConfigModal
        key={isSupabaseConfigOpen ? 'config-open-bottom' : 'config-closed-bottom'}
        isOpen={isSupabaseConfigOpen}
        onClose={() => setIsSupabaseConfigOpen(false)}
      />

      {/* Mobile Sticky Bottom Navigation (Mobile UX 100% synchronized) */}
      <MobileBottomNav
        currentUser={currentUser}
        isViewingOwnProfile={isViewingOwnProfile}
        activeTab={activeTab}
        totalMovies={currentUserMovies.length}
        totalComments={viewingUserComments.length}
        onGoToMyProfile={() => {
          visitProfile(currentUser.id);
          setActiveTab('movies');
        }}
        onOpenCommunity={() => setActiveTab('community')}
        onOpenGuestbook={() => setActiveTab('guestbook')}
        onOpenAddMovie={handleOpenAddMovie}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={logout}
      />

      {/* Toast feedback notification */}
      <ToastNotification toast={toastMessage} />
    </div>
  );
}
