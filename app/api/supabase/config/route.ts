import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// In-memory cache so updates take effect immediately without requiring dev server restart
let serverSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
let serverSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Try reading from .env.local on initial start if process.env isn't populated
try {
  const envLocalPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envLocalPath)) {
    const envContent = fs.readFileSync(envLocalPath, 'utf-8');
    const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=["']?([^"'\n\r]+)["']?/);
    const keyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=["']?([^"'\n\r]+)["']?/);
    if (urlMatch?.[1]) serverSupabaseUrl = urlMatch[1].trim();
    if (keyMatch?.[1]) serverSupabaseAnonKey = keyMatch[1].trim();
  }
} catch {
  // Ignore filesystem errors in restricted environments
}

function checkIsConfigured(url: string, key: string): boolean {
  return Boolean(
    url &&
    key &&
    (url.startsWith('https://') || url.startsWith('http://')) &&
    !url.includes('your-project') &&
    !key.includes('your-anon-key') &&
    key.length > 20
  );
}

export async function GET() {
  const isConfigured = checkIsConfigured(serverSupabaseUrl, serverSupabaseAnonKey);

  return NextResponse.json({
    url: serverSupabaseUrl,
    anonKey: serverSupabaseAnonKey,
    isConfigured,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url = (body.url || '').trim();
    const anonKey = (body.anonKey || '').trim();

    serverSupabaseUrl = url;
    serverSupabaseAnonKey = anonKey;

    // Persist to .env.local so it survives app restarts and is available to all devices
    try {
      const envLocalPath = path.join(process.cwd(), '.env.local');
      let currentContent = '';
      if (fs.existsSync(envLocalPath)) {
        currentContent = fs.readFileSync(envLocalPath, 'utf-8');
      }

      // Replace or append NEXT_PUBLIC_SUPABASE_URL
      if (/NEXT_PUBLIC_SUPABASE_URL=.*/.test(currentContent)) {
        currentContent = currentContent.replace(
          /NEXT_PUBLIC_SUPABASE_URL=.*/,
          `NEXT_PUBLIC_SUPABASE_URL="${url}"`
        );
      } else {
        currentContent += `\nNEXT_PUBLIC_SUPABASE_URL="${url}"`;
      }

      // Replace or append NEXT_PUBLIC_SUPABASE_ANON_KEY
      if (/NEXT_PUBLIC_SUPABASE_ANON_KEY=.*/.test(currentContent)) {
        currentContent = currentContent.replace(
          /NEXT_PUBLIC_SUPABASE_ANON_KEY=.*/,
          `NEXT_PUBLIC_SUPABASE_ANON_KEY="${anonKey}"`
        );
      } else {
        currentContent += `\nNEXT_PUBLIC_SUPABASE_ANON_KEY="${anonKey}"`;
      }

      fs.writeFileSync(envLocalPath, currentContent.trim() + '\n', 'utf-8');
    } catch (fsErr) {
      console.warn('Could not write to .env.local, using in-memory credentials:', fsErr);
    }

    const isConfigured = checkIsConfigured(url, anonKey);

    return NextResponse.json({
      success: true,
      url,
      anonKey,
      isConfigured,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Erro ao salvar credenciais' },
      { status: 500 }
    );
  }
}
