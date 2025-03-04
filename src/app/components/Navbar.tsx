"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown, Menu, X } from 'lucide-react';

type User = {
  full_name: string;
  role?: string;
} | null;

export default function MergedNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<User>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutMessage, setShowLogoutMessage] = useState(false);

  // Load user and role from localStorage
  const loadFromStorage = useCallback(() => {
    const storedUser = localStorage.getItem('user');
    setUser(storedUser ? JSON.parse(storedUser) : null);
    const role = localStorage.getItem('userRole');
    setUserRole(role);
  }, []);

  useEffect(() => {
    loadFromStorage();

    // Listen for storage and focus events to update the navbar if changes happen elsewhere
    const handleStorageChange = () => loadFromStorage();
    const handleFocus = () => loadFromStorage();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadFromStorage]);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userRole');
    window.dispatchEvent(new Event('storage'));
    setUser(null);
    setUserRole(null);
    setShowLogoutMessage(true);
    router.push('/login');
  };

  useEffect(() => {
    if (showLogoutMessage) {
      const timer = setTimeout(() => {
        setShowLogoutMessage(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showLogoutMessage]);

  const LogoutMessage = () => (
    <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-2xl z-50">
      You have successfully logged out
    </div>
  );

  // Determine if this is an admin session
  const isAdmin = userRole === '"admin"' || userRole === '"root"';

  // Define the links for each navbar type
  const clientLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/elections/register', label: 'Register Election' },
    { href: '/elections/vote', label: 'Vote' },
    { href: '/elections/results/live', label: 'Live Results' },
    { href: '/elections/results/final', label: 'Final Results' },
    { href: '/candidate/register', label: 'Candidate Registration' },
  ];

  const adminLinks = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/create-admin', label: 'Create Admin' },
    { href: '/admin/create-election', label: 'Create Election' },
    { href: '/admin/approve-candidates', label: 'Approve Candidates' },
    { href: '/admin/view-registrations', label: 'View Registrations' },
    { href: '/admin/check-integrity', label: 'Check Vote Integrity' },
    { href: '/admin/results/live', label: 'Live Results' },
    { href: '/admin/results/published', label: 'Published Results' },
  ];

  const links = isAdmin ? adminLinks : clientLinks;
  const homeHref = isAdmin ? '/admin' : '/';
  const portalName = isAdmin ? 'Admin Portal' : 'Voting Portal';

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-gradient-to-r from-gray-800 to-gray-900 shadow-xl transition-all h-[72px]">
        <div className="flex items-center justify-between h-16 px-6">
          <Link href={homeHref} className="flex items-center">
            <img className="h-10 mr-3" src="/logo.png" alt={`${portalName} Logo`} />
            <span className="text-2xl font-extrabold bg-gradient-to-r from-yellow-400 to-red-600 bg-clip-text text-transparent">
              {portalName}
            </span>
          </Link>
          <div className="lg:hidden">
            <button onClick={toggleMobileMenu} className="p-2 text-white focus:outline-none">
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <>
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-lg px-4 py-2 rounded-md border transition-colors duration-300 ${
                      pathname === link.href
                        ? 'bg-gray-700 border-transparent'
                        : 'bg-transparent border-gray-800 hover:border-transparent hover:bg-gray-700'
                    } text-yellow-400`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="h-8 w-px bg-gray-600" />
                <div className="relative">
                  <button
                    onClick={toggleDropdown}
                    className="flex items-center gap-1 px-4 py-2 rounded-md border border-gray-800 bg-gray-700 text-lg text-yellow-400 transition-transform duration-300 hover:bg-gray-600"
                  >
                    <span>{user.full_name}</span>
                    <ChevronDown
                      className={`h-5 w-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md border border-yellow-400 shadow-2xl bg-gray-900">
                      <div className="py-1">
                        <button
                          className="w-full text-left block px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                          onClick={handleLogout}
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {isAdmin ? (
                  <Link
                    href="/login"
                    className="text-lg px-4 py-2 rounded-md bg-gray-700 text-yellow-400 hover:bg-gray-600 transition-colors duration-300"
                  >
                    Login
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/register"
                      className="text-lg px-4 py-2 rounded-md bg-yellow-400 text-gray-900 hover:bg-yellow-500 transition-colors duration-300"
                    >
                      Register
                    </Link>
                    <Link
                      href="/login"
                      className="text-lg px-4 py-2 rounded-md bg-gray-700 text-yellow-400 hover:bg-gray-600 transition-colors duration-300"
                    >
                      Login
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-gray-900 w-full absolute top-16 left-0 border-t border-gray-700 shadow-xl">
            <div className="flex flex-col p-4 space-y-3">
              {user ? (
                <>
                  {links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-lg text-yellow-400 py-2 px-4 rounded-md hover:bg-gray-700 transition-colors duration-300"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <button
                    className="text-lg text-left text-red-400 py-2 px-4 rounded-md hover:bg-gray-700 transition-colors duration-300"
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  {isAdmin ? (
                    <Link
                      href="/login"
                      className="text-lg text-yellow-400 bg-gray-700 py-2 px-4 rounded-md hover:bg-gray-600 transition-colors duration-300"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/register"
                        className="text-lg text-gray-900 bg-yellow-400 py-2 px-4 rounded-md hover:bg-yellow-500 transition-colors duration-300"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Register
                      </Link>
                      <Link
                        href="/login"
                        className="text-lg text-yellow-400 bg-gray-700 py-2 px-4 rounded-md hover:bg-gray-600 transition-colors duration-300"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Login
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </nav>
      {showLogoutMessage && <LogoutMessage />}
    </>
  );
}
