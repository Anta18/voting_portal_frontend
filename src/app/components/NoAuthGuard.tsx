'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function NoAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      router.push('/dashboard');
    } else {
      setAllowed(true);
    }
  }, [router]);

  if (!allowed) {
    return <div>Loading...</div>;
  }
  return <>{children}</>;
}
