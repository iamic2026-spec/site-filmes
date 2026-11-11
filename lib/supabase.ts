import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, Movie, ProfileComment } from './types';

// Environment variables fallback
let clientSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
let clientSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let cachedClient: SupabaseClient | null = null;

export function getSupabaseCredentials(): { url: string; anonKey: string; isConfigured: boolean } {
  // If stored in memory or env
  const isValidUrl = Boolean(
    clientSupabaseUrl &&
    !clientSupabaseUrl.includes('your-project') &&
    (clientSupabaseUrl.startsWith('https://') || clientSupabaseUrl.startsWith('http://'))
  );

  const isValidKey = Boolean(
    clientSupabaseAnonKey &&
    !clientSupabaseAnonKey.includes('your-anon-key') &&
    clientSupabaseAnonKey.length > 20
  );

  return {
    url: clientSupabaseUrl,
    anonKey: clientSupabaseAnonKey,
    isConfigured: isValidUrl && isValidKey,
  };
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getSupabaseCredentials();

  if (!isConfigured) {
    return null;
  }

  if (!cachedClient) {
    try {
      cachedClient = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
    } catch (err) {
      console.error('Erro ao inicializar cliente Supabase:', err);
      return null;
    }
  }

  return cachedClient;
}

// Fetch synchronized credentials from the server so Mobile & Desktop share the exact same configuration
export async function syncSupabaseConfigFromServer(): Promise<{ url: string; anonKey: string; isConfigured: boolean }> {
  try {
    const res = await fetch('/api/supabase/config', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data.url && data.anonKey) {
        clientSupabaseUrl = data.url;
        clientSupabaseAnonKey = data.anonKey;
        cachedClient = null; // Recreate with fresh credentials
      }
      return {
        url: data.url || '',
        anonKey: data.anonKey || '',
        isConfigured: Boolean(data.isConfigured),
      };
    }
  } catch (err) {
    console.warn('Erro ao buscar configuração Supabase do servidor:', err);
  }

  return getSupabaseCredentials();
}

// Save credentials to the server so ALL devices (mobile and desktop) immediately synchronize
export async function saveSupabaseCredentialsToServer(url: string, anonKey: string): Promise<boolean> {
  clientSupabaseUrl = url.trim();
  clientSupabaseAnonKey = anonKey.trim();
  cachedClient = null;

  try {
    const res = await fetch('/api/supabase/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: clientSupabaseUrl, anonKey: clientSupabaseAnonKey }),
    });

    if (res.ok) {
      const data = await res.json();
      return Boolean(data.success);
    }
  } catch (err) {
    console.error('Erro ao salvar credenciais Supabase no servidor:', err);
  }

  return false;
}

export function clearSupabaseCredentials(): void {
  clientSupabaseUrl = '';
  clientSupabaseAnonKey = '';
  cachedClient = null;
}

// ==========================================
// MAPPERS: Supabase DB Columns <-> App Types
// ==========================================

export function mapRowToUser(row: any): User {
  return {
    id: String(row.id),
    email: row.email || undefined,
    name: row.name || 'Cinéfilo',
    username: row.username || 'cinelumina',
    avatar:
      row.avatar ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    coverImage:
      row.cover_image ||
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
    bio: row.bio || 'Amante da sétima arte compartilhando meus filmes favoritos.',
    favoriteGenres: Array.isArray(row.favorite_genres) && row.favorite_genres.length > 0
      ? row.favorite_genres
      : ['Ficção Científica', 'Drama'],
    joinedDate: row.created_at
      ? new Date(row.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      : 'Recente',
    badge: row.badge || 'Cinéfilo',
    followersCount: typeof row.followers_count === 'number' ? row.followers_count : 0,
    followingCount: typeof row.following_count === 'number' ? row.following_count : 0,
    isGuest: false,
  };
}

export function mapRowToMovie(row: any): Movie {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    title: row.title || 'Sem título',
    director: row.director || 'Desconhecido',
    year: typeof row.year === 'number' ? row.year : new Date().getFullYear(),
    genre: row.genre || 'Geral',
    rating: typeof row.rating === 'number' ? row.rating : Number(row.rating) || 9.0,
    userReview: row.user_review || '',
    posterUrl:
      row.poster_url ||
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
    backdropUrl: row.banner_url || row.poster_url || undefined,
    duration: row.synopsis ? undefined : '2h',
    createdAt: row.created_at || new Date().toISOString(),
    likesCount: typeof row.likes === 'number' ? row.likes : 0,
  };
}

export function mapRowToComment(row: any): ProfileComment {
  return {
    id: String(row.id),
    profileUserId: String(row.profile_user_id),
    authorId: String(row.author_id),
    authorName: row.author_name || 'Cinéfilo',
    authorUsername: row.author_username || 'usuario',
    authorAvatar:
      row.author_avatar ||
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
    content: row.content || '',
    movieMention: row.movie_tag || undefined,
    createdAt: row.created_at
      ? new Date(row.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
      : 'Hoje',
    likes: typeof row.likes === 'number' ? row.likes : 0,
  };
}

// ==========================================
// REMOTE DATABASE QUERIES (Supabase Cloud)
// ==========================================

export async function fetchRemoteProfiles(client: SupabaseClient): Promise<User[]> {
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Erro ao buscar perfis no Supabase:', error);
    return [];
  }

  return (data || []).map(mapRowToUser);
}

export async function fetchRemoteMovies(client: SupabaseClient): Promise<Movie[]> {
  const { data, error } = await client
    .from('movies')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Erro ao buscar filmes no Supabase:', error);
    return [];
  }

  return (data || []).map(mapRowToMovie);
}

export async function fetchRemoteComments(client: SupabaseClient): Promise<ProfileComment[]> {
  const { data, error } = await client
    .from('profile_comments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Erro ao buscar comentários no Supabase:', error);
    return [];
  }

  return (data || []).map(mapRowToComment);
}

export async function dbUpsertProfile(client: SupabaseClient, user: Partial<User> & { id: string }): Promise<boolean> {
  const payload: any = {
    id: user.id,
    name: user.name,
    username: user.username,
    avatar: user.avatar,
    cover_image: user.coverImage,
    bio: user.bio,
    favorite_genres: user.favoriteGenres,
    badge: user.badge || 'Cinéfilo',
    updated_at: new Date().toISOString(),
  };

  if (user.email) payload.email = user.email;

  const { error } = await client.from('profiles').upsert(payload, { onConflict: 'id' });
  if (error) {
    console.warn('Erro ao salvar perfil no Supabase:', error);
    return false;
  }
  return true;
}

export async function dbInsertMovie(
  client: SupabaseClient,
  movie: Omit<Movie, 'id' | 'createdAt' | 'likesCount'> & { id?: string }
): Promise<Movie | null> {
  const payload: any = {
    user_id: movie.userId,
    title: movie.title,
    director: movie.director,
    year: movie.year,
    genre: movie.genre,
    rating: movie.rating,
    poster_url: movie.posterUrl,
    banner_url: movie.backdropUrl || movie.posterUrl,
    user_review: movie.userReview,
    likes: 0,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await client.from('movies').insert(payload).select().single();
  if (error) {
    console.warn('Erro ao cadastrar filme no Supabase:', error);
    return null;
  }

  return mapRowToMovie(data);
}

export async function dbUpdateMovie(
  client: SupabaseClient,
  movieId: string,
  fields: Partial<Movie>
): Promise<boolean> {
  const payload: any = {
    updated_at: new Date().toISOString(),
  };

  if (fields.title) payload.title = fields.title;
  if (fields.director) payload.director = fields.director;
  if (fields.year) payload.year = fields.year;
  if (fields.genre) payload.genre = fields.genre;
  if (typeof fields.rating === 'number') payload.rating = fields.rating;
  if (fields.userReview !== undefined) payload.user_review = fields.userReview;
  if (fields.posterUrl) payload.poster_url = fields.posterUrl;
  if (fields.backdropUrl) payload.banner_url = fields.backdropUrl;
  if (typeof fields.likesCount === 'number') payload.likes = fields.likesCount;

  const { error } = await client.from('movies').update(payload).eq('id', movieId);
  if (error) {
    console.warn('Erro ao atualizar filme no Supabase:', error);
    return false;
  }
  return true;
}

export async function dbDeleteMovie(client: SupabaseClient, movieId: string): Promise<boolean> {
  const { error } = await client.from('movies').delete().eq('id', movieId);
  if (error) {
    console.warn('Erro ao remover filme no Supabase:', error);
    return false;
  }
  return true;
}

export async function dbInsertComment(
  client: SupabaseClient,
  comment: Omit<ProfileComment, 'id' | 'createdAt' | 'likes'>
): Promise<ProfileComment | null> {
  const payload: any = {
    profile_user_id: comment.profileUserId,
    author_id: comment.authorId,
    author_name: comment.authorName,
    author_username: comment.authorUsername,
    author_avatar: comment.authorAvatar,
    content: comment.content,
    movie_tag: comment.movieMention || null,
    likes: 0,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await client.from('profile_comments').insert(payload).select().single();
  if (error) {
    console.warn('Erro ao inserir comentário no Supabase:', error);
    return null;
  }
  return mapRowToComment(data);
}

export async function dbDeleteComment(client: SupabaseClient, commentId: string): Promise<boolean> {
  const { error } = await client.from('profile_comments').delete().eq('id', commentId);
  if (error) {
    console.warn('Erro ao apagar comentário no Supabase:', error);
    return false;
  }
  return true;
}

export async function dbDeleteProfile(client: SupabaseClient, userId: string): Promise<boolean> {
  const { error } = await client.from('profiles').delete().eq('id', userId);
  if (error) {
    console.warn('Erro ao excluir perfil no Supabase:', error);
    return false;
  }
  return true;
}
