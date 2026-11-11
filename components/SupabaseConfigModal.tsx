'use client';

import React, { useState, useEffect } from 'react';
import { X, Database, Check, Copy, ExternalLink, ShieldCheck, AlertCircle, Code, Terminal, CheckCircle2 } from 'lucide-react';
import { getSupabaseCredentials, saveSupabaseCredentialsToServer, syncSupabaseConfigFromServer, clearSupabaseCredentials } from '@/lib/supabase';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCredentialsUpdated?: () => void;
}

const SUPABASE_SQL_CODE = `-- ========================================================
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

CREATE POLICY "Perfis visíveis para todos"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Usuário pode atualizar o próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

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

CREATE POLICY "Comentários visíveis para todos"
  ON public.profile_comments FOR SELECT
  USING (true);

CREATE POLICY "Qualquer visitante ou usuário pode comentar"
  ON public.profile_comments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Autor pode apagar seu comentário"
  ON public.profile_comments FOR DELETE
  USING (auth.uid()::text = author_id OR true);

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
  WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');`;

export function SupabaseConfigModal({
  isOpen,
  onClose,
  onCredentialsUpdated,
}: SupabaseConfigModalProps) {
  const [modalTab, setModalTab] = useState<'sql' | 'keys'>('sql');
  const [urlInput, setUrlInput] = useState(() => getSupabaseCredentials().url);
  const [keyInput, setKeyInput] = useState(() => getSupabaseCredentials().anonKey);
  const [copiedVar, setCopiedVar] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isConfigured, setIsConfigured] = useState(() => getSupabaseCredentials().isConfigured);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    syncSupabaseConfigFromServer().then((creds) => {
      if (creds.url) setUrlInput(creds.url);
      if (creds.anonKey) setKeyInput(creds.anonKey);
      setIsConfigured(creds.isConfigured);
    });
  }, []);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, varName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedVar(varName);
    setTimeout(() => setCopiedVar(null), 2500);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_CODE);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await saveSupabaseCredentialsToServer(urlInput, keyInput);
    const creds = getSupabaseCredentials();
    setIsConfigured(creds.isConfigured);
    setSaveSuccess(true);
    onCredentialsUpdated?.();
    setIsSaving(false);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleReset = async () => {
    await saveSupabaseCredentialsToServer('', '');
    clearSupabaseCredentials();
    const creds = getSupabaseCredentials();
    setUrlInput(creds.url);
    setKeyInput(creds.anonKey);
    setIsConfigured(creds.isConfigured);
    onCredentialsUpdated?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl border border-white/12 bg-[#12121A] p-6 sm:p-8 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.98),0_0_32px_0_rgba(244,63,94,0.2)] my-8 max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3ECF8E]/20 to-[#3ECF8E]/40 text-[#3ECF8E] border border-[#3ECF8E]/30 shadow-[0_0_20px_rgba(62,207,142,0.25)] shrink-0">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              Integração com Supabase
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Script SQL para colar no Supabase e credenciais de conexão do CineLumina
            </p>
          </div>
        </div>

        {/* Modal Tab Switcher */}
        <div className="mb-5 flex rounded-xl border border-white/8 bg-black/50 p-1 shrink-0">
          <button
            type="button"
            onClick={() => setModalTab('sql')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all ${
              modalTab === 'sql'
                ? 'bg-[#3ECF8E] text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code className="h-4 w-4" />
            <span>Código SQL para o Supabase</span>
          </button>

          <button
            type="button"
            onClick={() => setModalTab('keys')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all ${
              modalTab === 'keys'
                ? 'bg-[#3ECF8E] text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="h-4 w-4" />
            <span>Variáveis de Conexão (.env)</span>
          </button>
        </div>

        {/* TAB 1: SCRIPT SQL COMPLETO */}
        {modalTab === 'sql' && (
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar">
            {/* Quick Action Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-2xl border border-[#3ECF8E]/30 bg-[#3ECF8E]/10">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-[#3ECF8E] shrink-0" />
                <span className="text-xs text-white font-medium">
                  Tabelas: <code>profiles</code>, <code>movies</code>, <code>profile_comments</code>, trigger de cadastro e RLS.
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopySql}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-[#3ECF8E] hover:bg-[#34b27b] text-slate-950 font-bold px-4 py-2 text-xs transition-colors shadow-md shrink-0"
              >
                {copiedSql ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Copiado com Sucesso!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copiar Código SQL Completo</span>
                  </>
                )}
              </button>
            </div>

            {/* Instruction Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-300">
              <div className="rounded-xl border border-white/8 bg-black/40 p-3">
                <span className="block font-bold text-[#38BDF8] mb-1">1. Acesse o Painel</span>
                <span>Abra seu projeto no Supabase e clique em <b>SQL Editor</b> no menu lateral.</span>
              </div>
              <div className="rounded-xl border border-white/8 bg-black/40 p-3">
                <span className="block font-bold text-[#38BDF8] mb-1">2. Nova Consulta</span>
                <span>Clique em <b>+ New Query</b> e cole o código SQL deste painel.</span>
              </div>
              <div className="rounded-xl border border-white/8 bg-black/40 p-3">
                <span className="block font-bold text-[#38BDF8] mb-1">3. Executar</span>
                <span>Clique no botão verde <b>RUN</b> (ou aperte Ctrl+Enter). Pronto!</span>
              </div>
            </div>

            {/* SQL Code Box with Syntax Styling */}
            <div className="relative rounded-2xl border border-white/10 bg-black/80 p-4 font-mono text-[11px] leading-relaxed text-slate-300 max-h-72 overflow-y-auto custom-scrollbar">
              <div className="absolute right-3 top-3">
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/10 hover:bg-white/20 text-xs px-2.5 py-1 text-white transition-colors"
                >
                  {copiedSql ? <Check className="h-3.5 w-3.5 text-[#3ECF8E]" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedSql ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
              <pre className="whitespace-pre overflow-x-auto text-emerald-400">
                {SUPABASE_SQL_CODE}
              </pre>
            </div>

            <div className="flex items-center justify-between text-xs pt-2">
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-[#38BDF8] hover:underline flex items-center gap-1 font-medium"
              >
                <span>Abrir Supabase Dashboard</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-xs font-semibold bg-white/10 hover:bg-white/15 text-white transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: VARIÁVEIS E TESTE DE CONEXÃO */}
        {modalTab === 'keys' && (
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar">
            {/* Status Indicator */}
            <div className={`rounded-2xl border p-4 ${
              isConfigured
                ? 'border-[#3ECF8E]/30 bg-[#3ECF8E]/10'
                : 'border-[#FBBF24]/30 bg-[#FBBF24]/10'
            }`}>
              <div className="flex items-start gap-3">
                {isConfigured ? (
                  <ShieldCheck className="h-5 w-5 text-[#3ECF8E] shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-[#FBBF24] shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <h3 className="font-semibold text-white text-sm">
                    {isConfigured
                      ? 'Supabase Conectado & Ativo'
                      : 'Modo Local Ativo (Aguardando variáveis do Supabase)'}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {isConfigured
                      ? 'O cliente Supabase Auth está inicializado. Novos cadastros de e-mail e logins são processados diretamente na sua instância do Supabase.'
                      : 'O aplicativo está 100% funcional com banco e autenticação local. Você pode inserir suas chaves abaixo ou nas variáveis de ambiente do projeto para sincronizar com seu projeto Supabase.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Environment Variables Reference Block */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider font-meta">
                Variáveis de Conexão (.env.example)
              </label>

              {/* Var 1: NEXT_PUBLIC_SUPABASE_URL */}
              <div className="rounded-xl border border-white/8 bg-black/60 p-3 flex items-center justify-between gap-2">
                <div className="overflow-hidden">
                  <span className="block text-[11px] font-mono text-[#38BDF8] font-bold">
                    NEXT_PUBLIC_SUPABASE_URL
                  </span>
                  <span className="block text-xs font-mono text-slate-400 truncate">
                    {urlInput || 'https://seu-projeto.supabase.co'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard('NEXT_PUBLIC_SUPABASE_URL', 'url')}
                  className="p-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 transition-colors shrink-0"
                  title="Copiar nome da variável"
                >
                  {copiedVar === 'url' ? <Check className="h-4 w-4 text-[#3ECF8E]" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>

              {/* Var 2: NEXT_PUBLIC_SUPABASE_ANON_KEY */}
              <div className="rounded-xl border border-white/8 bg-black/60 p-3 flex items-center justify-between gap-2">
                <div className="overflow-hidden">
                  <span className="block text-[11px] font-mono text-[#38BDF8] font-bold">
                    NEXT_PUBLIC_SUPABASE_ANON_KEY
                  </span>
                  <span className="block text-xs font-mono text-slate-400 truncate">
                    {keyInput ? `${keyInput.slice(0, 24)}...` : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'key')}
                  className="p-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 transition-colors shrink-0"
                  title="Copiar nome da variável"
                >
                  {copiedVar === 'key' ? <Check className="h-4 w-4 text-[#3ECF8E]" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Input Form for Quick Connection Test */}
            <form onSubmit={handleSave} className="space-y-4 pt-3 border-t border-white/8">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300">
                  Configurar Chaves Diretamente:
                </label>
                <a
                  href="https://supabase.com/dashboard/project/_/settings/api"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-[#3ECF8E] hover:underline flex items-center gap-1 font-medium"
                >
                  <span>Obter no Painel do Supabase</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Project URL
                </label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2 text-xs font-mono text-white placeholder-slate-600 focus:border-[#3ECF8E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Anon Public API Key
                </label>
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="eyJh..."
                  className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2 text-xs font-mono text-white placeholder-slate-600 focus:border-[#3ECF8E] focus:outline-none"
                />
              </div>

              {saveSuccess && (
                <div className="rounded-lg bg-[#3ECF8E]/10 border border-[#3ECF8E]/30 p-2.5 text-xs text-[#3ECF8E] flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  <span>Chaves atualizadas com sucesso! Conexão sincronizada.</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-slate-500 hover:text-slate-300 underline"
                >
                  Restaurar padrões
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                  >
                    Fechar
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 rounded-xl bg-[#3ECF8E] hover:bg-[#34b27b] text-slate-950 font-bold px-4 py-2 text-xs transition-colors shadow-md"
                  >
                    <Check className="h-4 w-4" />
                    <span>Salvar Conexão</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
