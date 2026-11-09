'use client';

import { useState, useEffect, useCallback, useMemo, useSyncExternalStore } from 'react';
import { User, Movie, ProfileComment } from '@/lib/types';
import { INITIAL_USERS, INITIAL_MOVIES, INITIAL_COMMENTS } from '@/lib/initialData';
import { getSupabaseClient, getSupabaseCredentials } from '@/lib/supabase';

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
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((u: User) => {
              if (!u.isGuest && !u.password) {
                const initMatch = INITIAL_USERS.find((init) => init.id === u.id);
                return {
                  ...u,
                  password: initMatch?.password || '123456',
                };
              }
              return u;
            });
          }
        }
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

  // Register new user account with email and Supabase integration
  const registerWithEmail = useCallback(async (
    email: string,
    password?: string,
    userData?: {
      name: string;
      username: string;
      bio: string;
      avatar?: string;
      favoriteGenres: string[];
    }
  ) => {
    const cleanEmail = email.trim().toLowerCase();
    const name = userData?.name.trim() || cleanEmail.split('@')[0];
    const username = (userData?.username || cleanEmail.split('@')[0]).replace('@', '').toLowerCase();
    const bio = userData?.bio?.trim() || 'Amante da sétima arte compartilhando meus filmes favoritos no CineLumina.';
    const avatar = userData?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
    const favoriteGenres = userData?.favoriteGenres && userData.favoriteGenres.length > 0
      ? userData.favoriteGenres
      : ['Ficção Científica', 'Drama'];

    const supabase = getSupabaseClient();
    let supabaseId: string | null = null;

    if (supabase && password) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              name,
              username,
              bio,
              avatar,
              favoriteGenres,
            },
          },
        });

        if (error) {
          throw error;
        }

        if (data.user) {
          supabaseId = data.user.id;
        }
      } catch (err: any) {
        console.warn('Supabase Auth error:', err);
        // Display toast error or proceed to local sync
        showToast(err.message || 'Aviso do Supabase. Salvando localmente.', 'info');
      }
    }

    const newUser: User = {
      id: supabaseId ? `sb-${supabaseId}` : `user-${Date.now()}`,
      email: cleanEmail,
      password: password || '123456',
      name,
      username,
      avatar,
      coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
      bio,
      favoriteGenres,
      joinedDate: 'Hoje',
      badge: supabaseId ? 'Cinéfilo Supabase' : 'Novo Cinéfilo',
      followersCount: 0,
      followingCount: 0,
      isGuest: false,
    };

    setUsers((prev) => [newUser, ...prev]);
    setCurrentUserId(newUser.id);
    setViewingUserId(newUser.id);
    setIsAuthenticated(true);
    showToast(`Bem-vindo(a) ao CineLumina, ${newUser.name}! Cadastro concluído com sucesso.`, 'success');
    return newUser;
  }, [showToast]);

  // Legacy registerUser adapter
  const registerUser = useCallback((userData: {
    name: string;
    username: string;
    bio: string;
    avatar?: string;
    favoriteGenres: string[];
  }) => {
    const generatedEmail = `${userData.username.replace(/[^a-z0-9_]/g, '') || 'usuario'}@cinelumina.com`;
    return registerWithEmail(generatedEmail, '123456', userData);
  }, [registerWithEmail]);

  // Login with email or username with strict password check
  const loginWithEmail = useCallback(async (identifier: string, password?: string) => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPassword = password ? password.trim() : '';

    if (!cleanId) {
      throw new Error('Por favor, informe seu e-mail ou nome de usuário.');
    }
    if (!cleanPassword) {
      throw new Error('Por favor, informe a senha de acesso.');
    }

    const supabase = getSupabaseClient();

    if (supabase && cleanId.includes('@')) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanId,
          password: cleanPassword,
        });

        if (error) {
          throw error;
        }

        if (data.user) {
          const existing = users.find((u) => u.email === cleanId || u.id === `sb-${data.user.id}`);
          if (existing) {
            setCurrentUserId(existing.id);
            setViewingUserId(existing.id);
          } else {
            const meta = data.user.user_metadata || {};
            const newUser: User = {
              id: `sb-${data.user.id}`,
              email: cleanId,
              password: cleanPassword,
              name: meta.name || cleanId.split('@')[0],
              username: meta.username || cleanId.split('@')[0],
              avatar: meta.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
              bio: meta.bio || 'Cinéfilo conectado com Supabase.',
              favoriteGenres: meta.favoriteGenres || ['Ficção Científica'],
              joinedDate: 'Hoje',
              badge: 'Cinéfilo Supabase',
              followersCount: 0,
              followingCount: 0,
              isGuest: false,
            };
            setUsers((prev) => [newUser, ...prev]);
            setCurrentUserId(newUser.id);
            setViewingUserId(newUser.id);
          }
          setIsAuthenticated(true);
          showToast(`Conectado com sucesso pelo Supabase!`, 'success');
          return true;
        }
      } catch (err: any) {
        console.warn('Erro ao autenticar com Supabase:', err);
        if (err?.message && (err.message.includes('Invalid') || err.message.includes('credentials') || err.message.includes('password'))) {
          throw new Error('E-mail ou senha incorretos. Verifique e tente novamente.');
        }
      }
    }

    // Match in local users by email or username
    const matched = users.find(
      (u) =>
        (u.email && u.email.toLowerCase() === cleanId) ||
        u.username.toLowerCase() === cleanId.replace('@', '')
    );

    if (matched) {
      // Validate password strictly: non-guest users MUST have correct password
      if (!matched.isGuest) {
        const expectedPassword = matched.password || '123456';
        if (cleanPassword !== expectedPassword) {
          throw new Error(`Senha incorreta para a conta @${matched.username}. Tente novamente.`);
        }
      }

      setCurrentUserId(matched.id);
      setViewingUserId(matched.id);
      setIsAuthenticated(true);
      showToast(`Conectado com sucesso como ${matched.name}!`, 'success');
      return true;
    }

    throw new Error('Nenhuma conta encontrada com este e-mail ou usuário. Crie seu cadastro na aba "Criar Cadastro".');
  }, [users, showToast]);

  // Switch to an account requiring its password
  const switchUserWithPassword = useCallback((userId: string, password?: string) => {
    const userToSwitch = users.find((u) => u.id === userId);
    if (!userToSwitch) {
      throw new Error('Perfil não encontrado.');
    }

    if (!userToSwitch.isGuest) {
      const expectedPassword = userToSwitch.password || '123456';
      const cleanPassword = password ? password.trim() : '';
      if (!cleanPassword) {
        throw new Error(`Por favor, digite a senha de ${userToSwitch.name}.`);
      }
      if (cleanPassword !== expectedPassword) {
        throw new Error(`Senha incorreta para a conta @${userToSwitch.username}.`);
      }
    }

    setCurrentUserId(userId);
    setViewingUserId(userId);
    setIsAuthenticated(true);
    showToast(`Conectado como ${userToSwitch.name}!`, 'info');
    return true;
  }, [users, showToast]);

  // Delete user profile and its associated data
  const deleteUserProfile = useCallback((userIdToDelete: string) => {
    // 1. Remove user from users list
    setUsers((prev) => prev.filter((u) => u.id !== userIdToDelete));

    // 2. Remove all movies registered by this user
    setMovies((prev) => prev.filter((m) => m.userId !== userIdToDelete));

    // 3. Remove all comments on this profile or written by this profile
    setComments((prev) =>
      prev.filter((c) => c.profileUserId !== userIdToDelete && c.authorId !== userIdToDelete)
    );

    // 4. Remove from followed users
    setFollowedUserIds((prev) => prev.filter((id) => id !== userIdToDelete));

    // 5. If this was the currently active user, log out immediately
    if (currentUserId === userIdToDelete) {
      const supabase = getSupabaseClient();
      if (supabase) {
        supabase.auth.signOut().catch(() => {});
      }
      setIsAuthenticated(false);
      showToast('Seu perfil e todos os filmes cadastrados foram excluídos.', 'info');
    } else {
      showToast('Perfil removido com sucesso.', 'info');
    }
  }, [currentUserId, showToast]);

  // Logout method
  const logout = useCallback(() => {
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.auth.signOut().catch(() => {});
    }
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
  };
}
