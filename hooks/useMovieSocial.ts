'use client';

import { useState, useEffect, useCallback, useMemo, useSyncExternalStore } from 'react';
import { User, Movie, ProfileComment } from '@/lib/types';
import { INITIAL_USERS, INITIAL_MOVIES, INITIAL_COMMENTS } from '@/lib/initialData';

const emptySubscribe = () => () => {};

const STORAGE_KEYS = {
  USERS: 'cinelumina_users_v2',
  MOVIES: 'cinelumina_movies_v2',
  COMMENTS: 'cinelumina_comments_v2',
  CURRENT_USER_ID: 'cinelumina_current_user_v2',
  FOLLOWING: 'cinelumina_following_v2',
};

export function useMovieSocial() {
  const isLoaded = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  
  const [users, setUsers] = useState<User[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.USERS);
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return INITIAL_USERS;
  });

  const [movies, setMovies] = useState<Movie[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.MOVIES);
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return INITIAL_MOVIES;
  });

  const [comments, setComments] = useState<ProfileComment[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.COMMENTS);
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return INITIAL_COMMENTS;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
        if (stored) return stored;
      } catch {}
    }
    return 'user-lucas';
  });

  const [viewingUserId, setViewingUserId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
        if (stored) return stored;
      } catch {}
    }
    return 'user-lucas';
  });

  const [followedUserIds, setFollowedUserIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.FOLLOWING);
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return ['user-beatriz'];
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ id: number; text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Save to localStorage when states change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      localStorage.setItem(STORAGE_KEYS.MOVIES, JSON.stringify(movies));
      localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
      localStorage.setItem(STORAGE_KEYS.FOLLOWING, JSON.stringify(followedUserIds));
    } catch {
      // Handle quota error gracefully
    }
  }, [users, movies, comments, currentUserId, followedUserIds, isLoaded]);

  const showToast = useCallback((text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ id: Date.now(), text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 3200);
  }, []);

  // Current logged in user object
  const currentUser = useMemo(() => {
    return users.find((u) => u.id === currentUserId) || users[0];
  }, [users, currentUserId]);

  // User currently being viewed
  const viewingUser = useMemo(() => {
    return users.find((u) => u.id === viewingUserId) || currentUser;
  }, [users, viewingUserId, currentUser]);

  const isViewingOwnProfile = currentUser.id === viewingUser.id;

  // Movies of the viewing user
  const viewingUserMovies = useMemo(() => {
    return movies.filter((m) => m.userId === viewingUser.id);
  }, [movies, viewingUser.id]);

  // Comments on the viewing user's profile
  const viewingUserComments = useMemo(() => {
    return comments.filter((c) => c.profileUserId === viewingUser.id);
  }, [comments, viewingUser.id]);

  // Navigate to visit any profile
  const visitProfile = useCallback((userId: string) => {
    setViewingUserId(userId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Switch logged in user
  const switchUser = useCallback((userId: string) => {
    const userToSwitch = users.find((u) => u.id === userId);
    if (userToSwitch) {
      setCurrentUserId(userId);
      setViewingUserId(userId);
      setIsAuthenticated(true);
      showToast(`Conectado como ${userToSwitch.name}`, 'info');
    }
  }, [users, showToast]);

  // Fast guest login
  const loginAsGuest = useCallback(() => {
    let guest = users.find((u) => u.id === 'user-guest');
    if (!guest) {
      guest = {
        id: 'user-guest',
        name: 'Visitante Cinéfilo',
        username: 'visitante_' + Math.floor(Math.random() * 899 + 100),
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
        coverImage: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1600&q=80',
        bio: 'Visitante explorando a comunidade CineLumina e descobrindo obras primas.',
        favoriteGenres: ['Geral', 'Cinema Moderno'],
        joinedDate: 'Hoje',
        badge: 'Visitante',
        followersCount: 0,
        followingCount: 1,
        isGuest: true,
      };
      setUsers((prev) => [...prev, guest!]);
    }
    setCurrentUserId(guest.id);
    setViewingUserId(guest.id);
    setIsAuthenticated(true);
    showToast('Acesso de Visitante liberado! Você já pode cadastrar filmes e comentar.', 'success');
  }, [users, showToast]);

  // Register new user account
  const registerUser = useCallback((userData: {
    name: string;
    username: string;
    bio: string;
    avatar?: string;
    favoriteGenres: string[];
  }) => {
    const cleanUsername = userData.username.replace('@', '').trim().toLowerCase();
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: userData.name.trim(),
      username: cleanUsername || `cinefilo_${Date.now().toString().slice(-4)}`,
      avatar: userData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
      bio: userData.bio.trim() || 'Amante da sétima arte compartilhando meus filmes favoritos no CineLumina.',
      favoriteGenres: userData.favoriteGenres.length ? userData.favoriteGenres : ['Ficção Científica', 'Drama'],
      joinedDate: 'Hoje',
      badge: 'Novo Cinéfilo',
      followersCount: 0,
      followingCount: 0,
      isGuest: false,
    };

    setUsers((prev) => [newUser, ...prev]);
    setCurrentUserId(newUser.id);
    setViewingUserId(newUser.id);
    setIsAuthenticated(true);
    showToast(`Bem-vindo(a) ao CineLumina, ${newUser.name}! Seu cadastro foi realizado com sucesso.`, 'success');
  }, [showToast]);

  // Logout method
  const logout = useCallback(() => {
    setIsAuthenticated(false);
    showToast('Você encerrou a sessão. Até logo, cinéfilo!', 'info');
  }, [showToast]);

  // Update profile
  const updateProfile = useCallback((updatedData: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUserId ? { ...u, ...updatedData } : u))
    );
    showToast('Perfil atualizado com sucesso!', 'success');
  }, [currentUserId, showToast]);

  // Toggle follow user
  const toggleFollowUser = useCallback((targetUserId: string) => {
    const isFollowed = followedUserIds.includes(targetUserId);
    setFollowedUserIds((prev) =>
      isFollowed ? prev.filter((id) => id !== targetUserId) : [...prev, targetUserId]
    );

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === targetUserId) {
          return {
            ...u,
            followersCount: Math.max(0, u.followersCount + (isFollowed ? -1 : 1)),
          };
        }
        return u;
      })
    );

    showToast(isFollowed ? 'Deixou de seguir o cinéfilo' : 'Você agora está seguindo este cinéfilo!', 'info');
  }, [followedUserIds, showToast]);

  // Add Movie
  const addMovie = useCallback((movieData: Omit<Movie, 'id' | 'userId' | 'createdAt' | 'likesCount'>) => {
    const newMovie: Movie = {
      ...movieData,
      id: `mov-${Date.now()}`,
      userId: currentUser.id,
      createdAt: new Date().toISOString(),
      likesCount: 0,
    };

    setMovies((prev) => [newMovie, ...prev]);
    showToast(`"${newMovie.title}" foi adicionado aos seus favoritos!`, 'success');
  }, [currentUser.id, showToast]);

  // Edit Movie
  const editMovie = useCallback((movieId: string, updatedFields: Partial<Movie>) => {
    setMovies((prev) =>
      prev.map((m) => (m.id === movieId ? { ...m, ...updatedFields } : m))
    );
    showToast('Filme atualizado com sucesso!', 'success');
  }, [showToast]);

  // Delete Movie
  const deleteMovie = useCallback((movieId: string) => {
    const movieToDelete = movies.find((m) => m.id === movieId);
    setMovies((prev) => prev.filter((m) => m.id !== movieId));
    showToast(`"${movieToDelete?.title || 'Filme'}" foi removido dos favoritos.`, 'info');
  }, [movies, showToast]);

  // Like Movie
  const likeMovie = useCallback((movieId: string) => {
    setMovies((prev) =>
      prev.map((m) => (m.id === movieId ? { ...m, likesCount: (m.likesCount || 0) + 1 } : m))
    );
    showToast('Você curtiu este filme favorito!', 'info');
  }, [showToast]);

  // Add Comment on Profile Guestbook
  const addComment = useCallback((profileUserId: string, content: string, movieMention?: string) => {
    if (!content.trim()) return;

    const newComment: ProfileComment = {
      id: `comm-${Date.now()}`,
      profileUserId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorUsername: currentUser.username,
      authorAvatar: currentUser.avatar,
      content: content.trim(),
      movieMention: movieMention?.trim() || undefined,
      createdAt: 'Agora mesmo',
      likes: 0,
      hasLiked: false,
    };

    setComments((prev) => [newComment, ...prev]);
    showToast('Sua mensagem foi publicada no mural deste cinéfilo!', 'success');
  }, [currentUser, showToast]);

  // Like Comment
  const toggleLikeComment = useCallback((commentId: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          const hasLiked = !!c.hasLiked;
          return {
            ...c,
            hasLiked: !hasLiked,
            likes: Math.max(0, c.likes + (hasLiked ? -1 : 1)),
          };
        }
        return c;
      })
    );
  }, []);

  // Delete Comment
  const deleteComment = useCallback((commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    showToast('Comentário removido.', 'info');
  }, [showToast]);

  // Reset to default seed
  const resetToDefault = useCallback(() => {
    setUsers(INITIAL_USERS);
    setMovies(INITIAL_MOVIES);
    setComments(INITIAL_COMMENTS);
    setCurrentUserId('user-lucas');
    setViewingUserId('user-lucas');
    setFollowedUserIds(['user-beatriz']);
    localStorage.clear();
    showToast('Dados restaurados com os cinéfilos originais!', 'info');
  }, [showToast]);

  return {
    isLoaded,
    isAuthenticated,
    setIsAuthenticated,
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
    resetToDefault,
  };
}
