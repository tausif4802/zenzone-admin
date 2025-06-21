'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to auth page after a short delay
    const timer = setTimeout(() => {
      router.push('/auth');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-900">
            ZenZone Admin
          </CardTitle>
          <CardDescription className="text-lg">
            Administrative Dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Welcome to the ZenZone administrative panel. Please sign in to
            continue.
          </p>
          <Button onClick={() => router.push('/auth')} className="w-full">
            Get Started
          </Button>
          <p className="text-sm text-gray-500">Redirecting automatically...</p>
        </CardContent>
      </Card>
    </div>
  );
}
