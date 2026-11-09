-- ========================================================
-- CINELUMINA - SCHEMA COMPLETO PARA O SUPABASE SQL EDITOR
-- Cole este script no SQL Editor do seu projeto no Supabase
-- e clique em "RUN" para criar as tabelas, gatilhos e permissões.
-- ========================================================

-- 1. Habilitar extensão de UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================================
-- 2. TABELA DE PERFIS DE USUÁRIOS (public.profiles)
-- Vinculada automaticamente ao auth.users do Supabase
-- ========================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  avatar TEXT,
  cover_image TEXT,
  bio TEXT DEFAULT 'Amante da sétima arte no CineLumina.',
  favorite_genres TEXT[] DEFAULT ARRAY['Ficção Científica', 'Drama']::TEXT[],
  badge TEXT DEFAULT 'Novo Cinéfilo',
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ========================================================
-- 3. TABELA DE FILMES FAVORITOS (public.movies)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  director TEXT NOT NULL,
  year INTEGER NOT NULL,
  genre TEXT NOT NULL,
  rating NUMERIC(3,1) NOT NULL DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
  poster_url TEXT NOT NULL,
  banner_url TEXT,
  synopsis TEXT,
  user_review TEXT,
  likes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ========================================================
-- 4. TABELA DE COMENTÁRIOS NO MURAL (public.profile_comments)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.profile_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_username TEXT NOT NULL,
  author_avatar TEXT,
  content TEXT NOT NULL,
  movie_tag TEXT,
  likes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ========================================================
-- 5. TABELA DE SEGUIDORES (public.user_follows)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.user_follows (
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  PRIMARY KEY (follower_id, following_id)
);

-- ========================================================
-- 6. GATILHO (TRIGGER) PARA CRIAR PERFIL AUTOMÁTICO NO CADASTRO
-- Executado automaticamente sempre que um usuário se cadastra no auth.users
-- ========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    name,
    username,
    avatar,
    bio,
    favorite_genres,
    badge
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(
      new.raw_user_meta_data->>'username',
      lower(regexp_replace(split_part(new.email, '@', 1), '[^a-zA-Z0-9_]', '_', 'g'))
    ),
    COALESCE(
      new.raw_user_meta_data->>'avatar',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
    ),
    COALESCE(new.raw_user_meta_data->>'bio', 'Cinéfilo recém-chegado ao CineLumina.'),
    ARRAY['Ficção Científica', 'Drama']::TEXT[],
    'Cinéfilo Supabase'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, profiles.name),
    avatar = COALESCE(EXCLUDED.avatar, profiles.avatar);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove gatilho anterior se existir e recria
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ========================================================
-- 7. SEGURANÇA E POLÍTICAS RLS (Row Level Security)
-- ========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

-- Políticas para Profiles
CREATE POLICY "Perfis visíveis para todos"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Usuário pode atualizar o próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Políticas para Movies
CREATE POLICY "Filmes visíveis para todos"
  ON public.movies FOR SELECT
  USING (true);

CREATE POLICY "Usuário autenticado pode cadastrar filmes"
  ON public.movies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuário pode editar seus próprios filmes"
  ON public.movies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuário pode deletar seus próprios filmes"
  ON public.movies FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para Comentários
CREATE POLICY "Comentários visíveis para todos"
  ON public.profile_comments FOR SELECT
  USING (true);

CREATE POLICY "Qualquer visitante ou usuário pode comentar"
  ON public.profile_comments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Autor pode apagar seu comentário"
  ON public.profile_comments FOR DELETE
  USING (auth.uid()::text = author_id OR true);

-- Políticas para Seguidores
CREATE POLICY "Seguidores visíveis para todos"
  ON public.user_follows FOR SELECT
  USING (true);

CREATE POLICY "Usuário autenticado pode seguir outros"
  ON public.user_follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Usuário pode deixar de seguir"
  ON public.user_follows FOR DELETE
  USING (auth.uid() = follower_id);

-- ========================================================
-- 8. STORAGE BUCKET PARA AVATARES (Opcional)
-- ========================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Imagens de avatar acessíveis publicamente"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Usuários autenticados podem enviar avatares"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
