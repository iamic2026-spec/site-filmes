import { createClient, SupabaseClient, User as SupabaseAuthUser } from '@supabase/supabase-js';

// Environment variables
const ENV_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const ENV_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Storage keys for optional browser-side override/fallback
const STORAGE_KEYS = {
  URL: 'cinelumina_supabase_url',
  ANON_KEY: 'cinelumina_supabase_anon_key',
};

export function getSupabaseCredentials(): { url: string; anonKey: string; isConfigured: boolean } {
  let url = ENV_SUPABASE_URL;
  let anonKey = ENV_SUPABASE_ANON_KEY;

  if (typeof window !== 'undefined') {
    const storedUrl = localStorage.getItem(STORAGE_KEYS.URL);
    const storedKey = localStorage.getItem(STORAGE_KEYS.ANON_KEY);
    if (storedUrl && storedKey) {
      url = storedUrl;
      anonKey = storedKey;
    }
  }

  const isValidUrl = Boolean(
    url &&
    !url.includes('your-project') &&
    (url.startsWith('https://') || url.startsWith('http://'))
  );

  const isValidKey = Boolean(
    anonKey &&
    !anonKey.includes('your-anon-key') &&
    anonKey.length > 20
  );

  return {
    url,
    anonKey,
    isConfigured: isValidUrl && isValidKey,
  };
}

export function saveSupabaseCredentials(url: string, anonKey: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.URL, url.trim());
    localStorage.setItem(STORAGE_KEYS.ANON_KEY, anonKey.trim());
    // Force re-create client
    cachedClient = null;
  }
}

export function clearSupabaseCredentials(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.URL);
    localStorage.removeItem(STORAGE_KEYS.ANON_KEY);
    cachedClient = null;
  }
}

let cachedClient: SupabaseClient | null = null;

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

export interface SupabaseUserProfile {
  id: string;
  email: string;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
  favoriteGenres?: string[];
}
