// Path: app/auth/callback/route.js

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    try {
      console.log('Menukar code untuk session:', code);
      const result = await supabase.auth.exchangeCodeForSession(code);
      console.log('Hasil exchangeCodeForSession:', result);
    } catch (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(`${requestUrl.origin}/signup?error=auth_error`)
    }
  }

  // Redirect to dashboard or home page after successful authentication
  return NextResponse.redirect(`${requestUrl.origin}/`)
}