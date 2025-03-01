// app/page.tsx
'use client';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="mt-10 text-center">
      <h1 className="text-3xl font-bold mb-4">Welcome to the Voting Portal</h1>
      <p className="mb-4">Participate in elections with ease and transparency.</p>
      <div className="space-x-4">
        <Link href="/login" className="text-blue-600 hover:underline">Login</Link>
        <Link href="/register" className="text-blue-600 hover:underline">Register</Link>
      </div>
    </div>
  );
}
