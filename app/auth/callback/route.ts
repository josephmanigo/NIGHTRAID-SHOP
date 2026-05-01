import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getURL } from '@/lib/utils';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${getURL().replace(/\/$/, '')}${next}`);
    }
  }

  // Return to auth page with an error message
  return NextResponse.redirect(`${getURL()}auth?error=Could not sign in. Please try again.`);
}
