'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      if(localStorage.getItem('userRole')==="\"admin\""||localStorage.getItem('userRole')==='\"root\"'){
        router.push('/admin');
      }else {
        router.push('/dashboard');
    }
    } else {
      router.push('/login');
    }
  }, [router]);

  return <div>Loading...</div>;
}
