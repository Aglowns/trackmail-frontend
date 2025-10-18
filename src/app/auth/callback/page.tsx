'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      console.log('Auth callback started');
      console.log('Current URL:', window.location.href);
      console.log('Hash:', window.location.hash);
      
      try {
        // Check if we're in the callback flow first
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        console.log('Access token found:', !!accessToken);
        console.log('Refresh token found:', !!refreshToken);
        
        if (accessToken && refreshToken) {
          console.log('Setting session with tokens');
          // Set the session with the tokens from URL
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          if (sessionError) {
            console.error('Session error:', sessionError);
            router.push('/login?error=session_failed');
          } else {
            console.log('Session set successfully, redirecting to dashboard');
            router.push('/');
          }
        } else {
          console.log('No tokens in URL, checking existing session');
          // Handle the auth callback from URL hash
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Auth callback error:', error);
            router.push('/login?error=auth_callback_failed');
            return;
          }

          if (data.session) {
            console.log('Existing session found, redirecting to dashboard');
            router.push('/');
          } else {
            console.log('No session found, redirecting to login');
            router.push('/login');
          }
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        router.push('/login?error=auth_callback_failed');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Confirming your account...</p>
      </div>
    </div>
  );
}
