// app/layout.tsx
import './globals.css';
import { ReactNode } from 'react';
import Navbar from './components/Navbar';

export const metadata = {
  title: 'Voter Portal',
  description: 'A minimalist portal for multi election voting',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="bg-gray-50 text-gray-800">
      <body>
        <Navbar />
        <main className="w-full min-h-[calc(100vh-72px)]">{children}</main>
      </body>
    </html>
  );
}
