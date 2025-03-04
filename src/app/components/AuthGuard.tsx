'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
    } else {
      if(localStorage.getItem('userRole')==="\"admin\""||localStorage.getItem('userRole')==='\"root\"'){
        router.push('/admin');}
        else{
      setAuthorized(true);
    }
    }
  }, [router]);

  if (!authorized) {
    return <div>Loading...</div>;
  }
  return <>{children}</>;
}
