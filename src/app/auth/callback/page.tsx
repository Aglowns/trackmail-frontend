'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { apiClient } from '@/lib/api';

export default function AuthCallback() {
  const router = useRouter();

  const createProfileWithSignupData = async () => {
    try {
      // Get stored profile data from localStorage
      const storedData = localStorage.getItem('pendingProfileData');
      if (!storedData) {
        console.log('No stored profile data found, using default profile creation');
        return;
      }

      const profileData = JSON.parse(storedData);
      console.log('Creating profile with stored data:', profileData);

      // Create profile using the API client
      const profilePayload = {
        full_name: profileData.fullName,
        phone: profileData.phone || '',
        notification_email: '', // Will be set from user email
      };

      // Use a custom API call to create profile with signup data
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/profiles/me`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify(profilePayload),
      });

      if (!response.ok) {
        throw new Error('Failed to create profile');
      }
      console.log('Profile created successfully with signup data');

      // Clear the stored data
      localStorage.removeItem('pendingProfileData');
    } catch (error) {
      console.error('Error creating profile with signup data:', error);
      // Don't fail the auth flow if profile creation fails
    }
  };

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
            console.log('Session set successfully, creating profile with signup data');
            // Create profile with stored signup data
            await createProfileWithSignupData();
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
            console.log('Existing session found, checking if profile exists');
            // Check if profile exists, create one if it doesn't
            try {
              await apiClient.getCurrentProfile();
              console.log('Profile exists, redirecting to dashboard');
            } catch (error) {
              console.log('Profile does not exist, creating default profile');
              await createProfileWithSignupData();
            }
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
