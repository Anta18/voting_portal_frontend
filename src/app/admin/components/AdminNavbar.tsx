// app/admin/components/AdminNavbar.tsx
import Link from 'next/link';

export default function AdminNavbar() {
  return (
    <nav className="bg-gray-200 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="font-bold text-xl">
          <Link href="/admin">Admin Panel</Link>
        </div>
        <div className="space-x-4">
          <Link href="/admin/create-admin" className="hover:text-blue-600">Create Admin</Link>
          <Link href="/admin/create-election" className="hover:text-blue-600">Create Election</Link>
          <Link href="/admin/approve-candidates" className="hover:text-blue-600">Approve Candidates</Link>
          <Link href="/admin/view-registrations" className="hover:text-blue-600">View Registrations</Link>
          <Link href="/admin/check-integrity" className="hover:text-blue-600">Check Vote Integrity</Link>
          <Link href="/admin/results/live" className="hover:text-blue-600">Live Results</Link>
          <Link href="/admin/results/published" className="hover:text-blue-600">Published Results</Link>
        </div>
      </div>
    </nav>
  );
}
