// app/admin/layout.tsx
import AdminGuard from './components/AdminGuard';
import '../globals.css';

export const metadata = {
  title: 'Admin Panel',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-800">
        <AdminGuard>
          <main className="w-full">{children}</main>
        </AdminGuard>
      </body>
    </html>
  );
}
