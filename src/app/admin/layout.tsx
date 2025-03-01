// app/admin/layout.tsx
import AdminGuard from './components/AdminGuard';
import AdminNavbar from './components/AdminNavbar';
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
          <AdminNavbar />
          <main className="max-w-7xl mx-auto p-4">{children}</main>
        </AdminGuard>
      </body>
    </html>
  );
}
