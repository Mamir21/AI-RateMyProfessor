'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/firebase';

export default function Page() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/home');  
      } else {
        router.push('/login'); 
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return null;  
}
