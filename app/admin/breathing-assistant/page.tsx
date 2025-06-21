'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BreathingAssistantPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new breathing guide page
    router.replace('/admin/breathing-guide');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to Breathing Guide...</p>
      </div>
    </div>
  );
}
