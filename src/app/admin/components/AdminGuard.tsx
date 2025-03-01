// app/admin/components/AdminGuard.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // Dummy check: assume localStorage.userRole holds the role (e.g., "admin")
    const role = localStorage.getItem('userRole');
    if (role !== 'admin') {
      router.push('/');
    }
  }, [router]);

  return <>{children}</>;
}
