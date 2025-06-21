'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SigninForm } from '@/components/auth/signin-form';
import { SignupForm } from '@/components/auth/signup-form';
import { Toaster } from '@/components/ui/sonner';

export default function AuthPage() {
  const [isSignup, setIsSignup] = useState(false);
  const router = useRouter();

  const handleAuthSuccess = (user: any) => {
    console.log('Authentication successful:', user);
    // Here you could set user in context/state management
    // For now, redirect to dashboard or home
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {isSignup ? (
          <SignupForm
            onSuccess={handleAuthSuccess}
            onSwitchToSignin={() => setIsSignup(false)}
          />
        ) : (
          <SigninForm
            onSuccess={handleAuthSuccess}
            onSwitchToSignup={() => setIsSignup(true)}
          />
        )}
      </div>
      <Toaster />
    </div>
  );
}
