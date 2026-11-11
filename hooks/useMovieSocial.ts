'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Movie, ProfileComment } from '@/lib/types';
import { INITIAL_USERS, INITIAL_MOVIES, INITIAL_COMMENTS } from '@/lib/initialData';
import {
  getSupabaseClient,
  getSupabaseCredentials,
  syncSupabaseConfigFromServer,
  fetchRemoteProfiles,
  fetchRemoteMovies,
  fetchRemoteComments,
  dbUpsertProfile,
  dbInsertMovie,
  dbUpdateMovie,
  dbDeleteMovie,
  dbInsertComment,
  dbDeleteComment,
  dbDeleteProfile,
} from '@/lib/supabase';

export function useMovieSocial() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(false);

  // Users: baseline initial demo cinephiles + all registered users loaded directly from Supabase
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [movies, setMovies] = useState<Movie[]>(INITIAL_MOVIES);
  const [comments, setComments] = useState<ProfileComment[]>(INITIAL_COMMENTS);

  const [currentUserId, setCurrentUserId] = useState<string>('user-lucas');
  const [viewingUserId, setViewingUserId] = useState<string>('user-lucas');
  const [followedUserIds, setFollowedUserIds] = useState<string[]>(['user-beatriz']);

  const [toastMessage, setToastMessage] = useState<{ id: number; text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ id: Date.now(), text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 3500);
  }, []);

  // Synchronize data from Supabase Cloud on mount & when credentials change
  const reloadFromSupabase = useCallback(async () => {
    const creds = await syncSupabaseConfigFromServer();
    const client = getSupabaseClient();

    if (!client || !creds.isConfigured) {
      setSupabaseConnected(false);
      setIsLoaded(true);
      return;
    }

    setSupabaseConnected(true);

    try {
      // 1. Fetch all cloud profiles from Supabase
      const remoteProfiles = await fetchRemoteProfiles(client);

      if (remoteProfiles && remoteProfiles.length > 0) {
        // Merge cloud profiles with baseline seed users so initial demo profiles remain accessible
        setUsers((prev) => {
          const remoteIds = new Set(remoteProfiles.map((p) => p.id));
          const remoteEmails = new Set(remoteProfiles.map((p) => p.email?.toLowerCase()).filter(Boolean));
          const remoteUsernames = new Set(remoteProfiles.map((p) => p.username?.toLowerCase()));

          // Keep baseline users that aren't overwritten in cloud
          const nonDuplicatedBase = INITIAL_USERS.filter(
            (b) =>
              !remoteIds.has(b.id) &&
              !remoteEmails.has(b.email?.toLowerCase()) &&
              !remoteUsernames.has(b.username?.toLowerCase())
          );

          return [...remoteProfiles, ...nonDuplicatedBase];
        });
      }

      // 2. Fetch all cloud movies from Supabase
      const remoteMovies = await fetchRemoteMovies(client);
      if (remoteMovies && remoteMovies.length > 0) {
        setMovies((prev) => {
          const remoteIds = new Set(remoteMovies.map((m) => m.id));
          const baseMovies = INITIAL_MOVIES.filter((m) => !remoteIds.has(m.id));
          return [...remoteMovies, ...baseMovies];
        });
      }

      // 3. Fetch all cloud comments from Supabase
      const remoteComments = await fetchRemoteComments(client);
      if (remoteComments && remoteComments.length > 0) {
        setComments((prev) => {
          const remoteIds = new Set(remoteComments.map((c) => c.id));
          const baseComments = INITIAL_COMMENTS.filter((c) => !remoteIds.has(c.id));
          return [...remoteComments, ...baseComments];
        });
      }

      // 4. Check active auth session in Supabase
      const { data: sessionData } = await client.auth.getSession();
      if (sessionData?.session?.user) {
        const authUser = sessionData.session.user;
        const matched = remoteProfiles.find(
          (p) => p.id === authUser.id || (p.email && p.email.toLowerCase() === authUser.email?.toLowerCase())
        );

        if (matched) {
          setCurrentUserId(matched.id);
          setViewingUserId(matched.id);
          setIsAuthenticated(true);
        }
      }
    } catch (err) {
      console.warn('Erro ao sincronizar dados com Supabase:', err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Initial load
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const creds = await syncSupabaseConfigFromServer();
      if (!isMounted) return;
      const client = getSupabaseClient();

      if (!client || !creds.isConfigured) {
        setSupabaseConnected(false);
        setIsLoaded(true);
        return;
      }

      setSupabaseConnected(true);

      try {
        const [remoteProfiles, remoteMovies, remoteComments] = await Promise.all([
          fetchRemoteProfiles(client),
          fetchRemoteMovies(client),
          fetchRemoteComments(client),
        ]);

        if (!isMounted) return;

        if (remoteProfiles && remoteProfiles.length > 0) {
          setUsers((prev) => {
            const remoteIds = new Set(remoteProfiles.map((p) => p.id));
            const remoteEmails = new Set(remoteProfiles.map((p) => p.email?.toLowerCase()).filter(Boolean));
            const remoteUsernames = new Set(remoteProfiles.map((p) => p.username?.toLowerCase()));
            const nonDuplicatedBase = INITIAL_USERS.filter(
              (b) =>
                !remoteIds.has(b.id) &&
                !remoteEmails.has(b.email?.toLowerCase()) &&
                !remoteUsernames.has(b.username?.toLowerCase())
            );
            return [...remoteProfiles, ...nonDuplicatedBase];
          });
        }

        if (remoteMovies && remoteMovies.length > 0) {
          setMovies((prev) => {
            const remoteIds = new Set(remoteMovies.map((m) => m.id));
            const baseMovies = INITIAL_MOVIES.filter((m) => !remoteIds.has(m.id));
            return [...remoteMovies, ...baseMovies];
          });
        }

        if (remoteComments && remoteComments.length > 0) {
          setComments((prev) => {
            const remoteIds = new Set(remoteComments.map((c) => c.id));
            const baseComments = INITIAL_COMMENTS.filter((c) => !remoteIds.has(c.id));
            return [...remoteComments, ...baseComments];
          });
        }

        const { data: sessionData } = await client.auth.getSession();
        if (sessionData?.session?.user && isMounted) {
          const authUser = sessionData.session.user;
          const matched = remoteProfiles.find(
            (p) => p.id === authUser.id || (p.email && p.email.toLowerCase() === authUser.email?.toLowerCase())
          );
          if (matched) {
            setCurrentUserId(matched.id);
            setViewingUserId(matched.id);
            setIsAuthenticated(true);
          }
        }
      } catch (err) {
        console.warn('Erro ao sincronizar dados com Supabase:', err);
      } finally {
        if (isMounted) {
          setIsLoaded(true);
        }
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  // Current logged in user object
  const currentUser = useMemo(() => {
    return users.find((u) => u.id === currentUserId) || users[0] || INITIAL_USERS[0];
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

  // Register new user account directly in Supabase Cloud
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
    const cleanPass = password?.trim() || '123456';
    const name = userData?.name.trim() || cleanEmail.split('@')[0];
    const username = (userData?.username || cleanEmail.split('@')[0]).replace('@', '').toLowerCase();
    const bio = userData?.bio?.trim() || 'Amante da sétima arte compartilhando meus filmes favoritos no CineLumina.';
    const avatar = userData?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
    const favoriteGenres = userData?.favoriteGenres && userData.favoriteGenres.length > 0
      ? userData.favoriteGenres
      : ['Ficção Científica', 'Drama'];

    const client = getSupabaseClient();
    let authUserId = `user-${Date.now()}`;

    if (client) {
      try {
        const { data: authData, error: authErr } = await client.auth.signUp({
          email: cleanEmail,
          password: cleanPass,
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

        if (authErr) {
          throw authErr;
        }

        if (authData.user) {
          authUserId = authData.user.id;
        }

        // Upsert profile in public.profiles table in Supabase Cloud
        await dbUpsertProfile(client, {
          id: authUserId,
          email: cleanEmail,
          name,
          username,
          avatar,
          bio,
          favoriteGenres,
          badge: 'Cinéfilo Supabase',
        });
      } catch (err: any) {
        console.error('Erro no cadastro Supabase:', err);
        throw new Error(err.message || 'Erro ao realizar cadastro no Supabase.');
      }
    }

    const newUser: User = {
      id: authUserId,
      email: cleanEmail,
      password: cleanPass,
      name,
      username,
      avatar,
      coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
      bio,
      favoriteGenres,
      joinedDate: 'Hoje',
      badge: client ? 'Cinéfilo Supabase' : 'Novo Cinéfilo',
      followersCount: 0,
      followingCount: 0,
      isGuest: false,
    };

    setUsers((prev) => [newUser, ...prev.filter((u) => u.id !== newUser.id && u.email !== newUser.email)]);
    setCurrentUserId(newUser.id);
    setViewingUserId(newUser.id);
    setIsAuthenticated(true);
    showToast(`Bem-vindo(a) ao CineLumina, ${newUser.name}! Cadastro concluído na nuvem.`, 'success');
    return newUser;
  }, [showToast]);

  // Legacy registerUser adapter
  const registerUser = useCallback((userData: {
    name: string;
    username: string;
    bio: string;
    avatar?: string;
    favoriteGenres: string[];
    password?: string;
  }) => {
    const generatedEmail = `${userData.username.replace(/[^a-z0-9_]/g, '') || 'usuario'}@cinelumina.com`;
    return registerWithEmail(generatedEmail, userData.password || '123456', userData);
  }, [registerWithEmail]);

  // Login with email or username with strict Supabase authentication
  const loginWithEmail = useCallback(async (identifier: string, password?: string) => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPassword = password ? password.trim() : '';

    if (!cleanId) {
      throw new Error('Por favor, informe seu e-mail ou nome de usuário.');
    }
    if (!cleanPassword) {
      throw new Error('Por favor, informe a senha de acesso.');
    }

    const client = getSupabaseClient();

    if (client) {
      let emailToAuth = cleanId;

      // If user typed a username (without @), query Supabase profiles to retrieve the registered email
      if (!cleanId.includes('@')) {
        const { data: profileByUsername } = await client
          .from('profiles')
          .select('id, email, username')
          .ilike('username', cleanId.replace('@', ''))
          .maybeSingle();

        if (profileByUsername?.email) {
          emailToAuth = profileByUsername.email.toLowerCase();
        }
      }

      try {
        const { data: authData, error: authErr } = await client.auth.signInWithPassword({
          email: emailToAuth,
          password: cleanPassword,
        });

        if (authErr) {
          throw authErr;
        }

        if (authData.user) {
          // Fetch or ensure profile in Supabase profiles table
          const { data: profileData } = await client
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .maybeSingle();

          let loggedInUser: User;
          if (profileData) {
            loggedInUser = {
              id: String(profileData.id),
              email: profileData.email || emailToAuth,
              name: profileData.name || emailToAuth.split('@')[0],
              username: profileData.username || emailToAuth.split('@')[0],
              avatar: profileData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
              coverImage: profileData.cover_image,
              bio: profileData.bio || 'Cinéfilo conectado ao CineLumina.',
              favoriteGenres: profileData.favorite_genres || ['Ficção Científica'],
              joinedDate: 'Hoje',
              badge: profileData.badge || 'Cinéfilo Supabase',
              followersCount: profileData.followers_count || 0,
              followingCount: profileData.following_count || 0,
              isGuest: false,
            };
          } else {
            const meta = authData.user.user_metadata || {};
            loggedInUser = {
              id: authData.user.id,
              email: emailToAuth,
              name: meta.name || emailToAuth.split('@')[0],
              username: meta.username || emailToAuth.split('@')[0],
              avatar: meta.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
              bio: meta.bio || 'Cinéfilo conectado ao CineLumina.',
              favoriteGenres: meta.favoriteGenres || ['Ficção Científica'],
              joinedDate: 'Hoje',
              badge: 'Cinéfilo Supabase',
              followersCount: 0,
              followingCount: 0,
              isGuest: false,
            };
            // Save profile in Supabase
            await dbUpsertProfile(client, loggedInUser);
          }

          setUsers((prev) => [loggedInUser, ...prev.filter((u) => u.id !== loggedInUser.id)]);
          setCurrentUserId(loggedInUser.id);
          setViewingUserId(loggedInUser.id);
          setIsAuthenticated(true);
          showToast(`Conectado com sucesso pelo Supabase! Olá, ${loggedInUser.name}!`, 'success');
          return true;
        }
      } catch (err: any) {
        console.warn('Erro ao autenticar com Supabase:', err);
        if (
          err?.message &&
          (err.message.includes('Invalid') ||
            err.message.includes('credentials') ||
            err.message.includes('password') ||
            err.message.includes('login credentials'))
        ) {
          throw new Error('E-mail ou senha incorretos no Supabase. Verifique e tente novamente.');
        }
      }
    }

    // Match in baseline demo users if not authenticated via remote Supabase
    const matched = users.find(
      (u) =>
        (u.email && u.email.toLowerCase() === cleanId) ||
        u.username.toLowerCase() === cleanId.replace('@', '')
    );

    if (matched) {
      if (!matched.isGuest) {
        const expectedPassword = matched.password || '123456';
        if (cleanPassword !== expectedPassword) {
          throw new Error(`Senha incorreta para a conta @${matched.username}. Tente novamente.`);
        }
      }

      setCurrentUserId(matched.id);
      setViewingUserId(matched.id);
      setIsAuthenticated(true);
      showToast(`Conectado como ${matched.name}!`, 'success');
      return true;
    }

    throw new Error('Nenhuma conta encontrada com este e-mail ou usuário no Supabase. Crie seu cadastro na aba "Novo Cadastro".');
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

  // Delete user profile and its associated data directly in Supabase
  const deleteUserProfile = useCallback(async (userIdToDelete: string) => {
    const client = getSupabaseClient();
    if (client) {
      await dbDeleteProfile(client, userIdToDelete);
    }

    setUsers((prev) => prev.filter((u) => u.id !== userIdToDelete));
    setMovies((prev) => prev.filter((m) => m.userId !== userIdToDelete));
    setComments((prev) =>
      prev.filter((c) => c.profileUserId !== userIdToDelete && c.authorId !== userIdToDelete)
    );
    setFollowedUserIds((prev) => prev.filter((id) => id !== userIdToDelete));

    if (currentUserId === userIdToDelete) {
      if (client) {
        client.auth.signOut().catch(() => {});
      }
      setIsAuthenticated(false);
      showToast('Seu perfil e dados foram excluídos com sucesso.', 'info');
    } else {
      showToast('Perfil removido com sucesso.', 'info');
    }
  }, [currentUserId, showToast]);

  // Logout method
  const logout = useCallback(() => {
    const client = getSupabaseClient();
    if (client) {
      client.auth.signOut().catch(() => {});
    }
    setIsAuthenticated(false);
    showToast('Você encerrou a sessão. Até logo, cinéfilo!', 'info');
  }, [showToast]);

  // Update profile in Supabase
  const updateProfile = useCallback(async (updatedData: Partial<User>) => {
    const client = getSupabaseClient();
    if (client && !currentUser.isGuest) {
      await dbUpsertProfile(client, {
        id: currentUserId,
        ...updatedData,
      });
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === currentUserId ? { ...u, ...updatedData } : u))
    );
    showToast('Perfil atualizado com sucesso!', 'success');
  }, [currentUserId, currentUser.isGuest, showToast]);

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

  // Add Movie with Supabase Cloud persistence
  const addMovie = useCallback(async (movieData: Omit<Movie, 'id' | 'userId' | 'createdAt' | 'likesCount'>) => {
    const client = getSupabaseClient();
    let savedMovie: Movie | null = null;

    if (client && !currentUser.isGuest) {
      savedMovie = await dbInsertMovie(client, {
        ...movieData,
        userId: currentUser.id,
      });
    }

    const newMovie: Movie = savedMovie || {
      ...movieData,
      id: `mov-${Date.now()}`,
      userId: currentUser.id,
      createdAt: new Date().toISOString(),
      likesCount: 0,
    };

    setMovies((prev) => [newMovie, ...prev.filter((m) => m.id !== newMovie.id)]);
    showToast(`"${newMovie.title}" foi adicionado aos seus favoritos!`, 'success');
  }, [currentUser, showToast]);

  // Edit Movie with Supabase Cloud persistence
  const editMovie = useCallback(async (movieId: string, updatedFields: Partial<Movie>) => {
    const client = getSupabaseClient();
    if (client && !currentUser.isGuest) {
      await dbUpdateMovie(client, movieId, updatedFields);
    }

    setMovies((prev) =>
      prev.map((m) => (m.id === movieId ? { ...m, ...updatedFields } : m))
    );
    showToast('Filme atualizado com sucesso!', 'success');
  }, [currentUser.isGuest, showToast]);

  // Delete Movie with Supabase Cloud persistence
  const deleteMovie = useCallback(async (movieId: string) => {
    const client = getSupabaseClient();
    if (client && !currentUser.isGuest) {
      await dbDeleteMovie(client, movieId);
    }

    const movieToDelete = movies.find((m) => m.id === movieId);
    setMovies((prev) => prev.filter((m) => m.id !== movieId));
    showToast(`"${movieToDelete?.title || 'Filme'}" foi removido dos favoritos.`, 'info');
  }, [currentUser.isGuest, movies, showToast]);

  // Like Movie
  const likeMovie = useCallback((movieId: string) => {
    setMovies((prev) =>
      prev.map((m) => {
        if (m.id === movieId) {
          const newLikes = (m.likesCount || 0) + 1;
          const client = getSupabaseClient();
          if (client && !currentUser.isGuest) {
            dbUpdateMovie(client, movieId, { likesCount: newLikes });
          }
          return { ...m, likesCount: newLikes };
        }
        return m;
      })
    );
    showToast('Você curtiu este filme favorito!', 'info');
  }, [currentUser.isGuest, showToast]);

  // Add Comment on Profile Guestbook with Supabase Cloud persistence
  const addComment = useCallback(async (profileUserId: string, content: string, movieMention?: string) => {
    if (!content.trim()) return;

    const client = getSupabaseClient();
    let savedComment: ProfileComment | null = null;

    if (client) {
      savedComment = await dbInsertComment(client, {
        profileUserId,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorUsername: currentUser.username,
        authorAvatar: currentUser.avatar,
        content: content.trim(),
        movieMention: movieMention?.trim() || undefined,
      });
    }

    const newComment: ProfileComment = savedComment || {
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

    setComments((prev) => [newComment, ...prev.filter((c) => c.id !== newComment.id)]);
    showToast('Sua mensagem foi publicada no mural deste cinéfilo!', 'success');
  }, [currentUser, showToast]);

  // Like Comment
  const toggleLikeComment = useCallback((commentId: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          const hasLiked = !c.hasLiked;
          return {
            ...c,
            hasLiked,
            likes: Math.max(0, c.likes + (hasLiked ? 1 : -1)),
          };
        }
        return c;
      })
    );
  }, []);

  // Delete Comment with Supabase Cloud persistence
  const deleteComment = useCallback(async (commentId: string) => {
    const client = getSupabaseClient();
    if (client) {
      await dbDeleteComment(client, commentId);
    }

    setComments((prev) => prev.filter((c) => c.id !== commentId));
    showToast('Comentário removido.', 'info');
  }, [showToast]);

  // Reset to default seed
  const resetToDefault = useCallback(() => {
    reloadFromSupabase();
    showToast('Dados recarregados da nuvem Supabase!', 'info');
  }, [reloadFromSupabase, showToast]);

  return {
    isLoaded,
    isAuthenticated,
    setIsAuthenticated,
    supabaseConnected,
    reloadFromSupabase,
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
