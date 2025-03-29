"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  Menu,
  X,
  LogOut,
  User,
  Home,
  Shield,
  CheckCircle,
  FileText,
  Vote,
  BarChart,
  UserPlus,
} from "lucide-react";

type User = {
  full_name: string;
  role?: string;
} | null;

type NavLink = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

export default function MergedNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<User>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutMessage, setShowLogoutMessage] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Load user and role from localStorage
  const loadFromStorage = useCallback(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      setUser(storedUser ? JSON.parse(storedUser) : null);
      const role = localStorage.getItem("userRole");
      setUserRole(role);
    }
  }, []);

  useEffect(() => {
    loadFromStorage();

    // Listen for storage and focus events to update the navbar if changes happen elsewhere
    const handleStorageChange = () => loadFromStorage();
    const handleFocus = () => loadFromStorage();

    // Add scroll event listener for navbar effect
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    // Click outside to close dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
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
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userRole");
    window.dispatchEvent(new Event("storage"));
    setUser(null);
    setUserRole(null);
    setShowLogoutMessage(true);
    router.push("/login");
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
    <div className="fixed bottom-4 right-4 bg-gradient-to-r from-red-600 to-red-500 text-white p-4 rounded-lg shadow-2xl z-50 flex items-center gap-2 animate-fadeIn">
      <CheckCircle size={20} />
      <span>You have successfully logged out</span>
    </div>
  );

  // Determine if this is an admin session
  const isAdmin = userRole === '"admin"' || userRole === '"root"';

  // Define the links for each navbar type with icons
  const clientLinks: NavLink[] = [
    { href: "/dashboard", label: "Dashboard", icon: <Home size={18} /> },
    {
      href: "/elections/verify-vote",
      label: "Verify Vote",
      icon: <FileText size={18} />,
    },
    { href: "/elections/vote", label: "Vote", icon: <Vote size={18} /> },
    {
      href: "/elections/results/live",
      label: "Live Results",
      icon: <BarChart size={18} />,
    },
    {
      href: "/elections/results/final",
      label: "Final Results",
      icon: <CheckCircle size={18} />,
    },
    {
      href: "/candidate/register",
      label: "Candidate Registration",
      icon: <UserPlus size={18} />,
    },
  ];

  const adminLinks: NavLink[] = [
    { href: "/admin", label: "Dashboard", icon: <Home size={18} /> },
    {
      href: "/admin/create-admin",
      label: "Create Admin",
      icon: <Shield size={18} />,
    },
    {
      href: "/admin/create-election",
      label: "Create Election",
      icon: <FileText size={18} />,
    },
    {
      href: "/admin/approve-candidates",
      label: "Approve Candidates",
      icon: <CheckCircle size={18} />,
    },
    {
      href: "/admin/view-registrations",
      label: "View Registrations",
      icon: <User size={18} />,
    },
    {
      href: "/admin/check-integrity",
      label: "Check Vote Integrity",
      icon: <Shield size={18} />,
    },
    {
      href: "/admin/results/live",
      label: "Live Results",
      icon: <BarChart size={18} />,
    },
    {
      href: "/admin/results/published",
      label: "Published Results",
      icon: <CheckCircle size={18} />,
    },
  ];

  const links = isAdmin ? adminLinks : clientLinks;
  const homeHref = isAdmin ? "/admin" : "/";
  const portalName = isAdmin ? "Admin Portal" : "Voting Portal";

  return (
    <>
      <nav
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "bg-gradient-to-r from-gray-900 to-gray-800 h-16 shadow-xl"
            : "bg-gradient-to-r from-gray-800 to-gray-900 h-[72px]"
        }`}
      >
        <div className="w-full mx-auto flex items-center justify-between h-full px-4 sm:px-6">
          <Link href={homeHref} className="flex items-center">
            <div className="relative h-[56px] mr-3 overflow-hidden">
              <img
                className="h-full w-full object-contain"
                src="/logo.png"
                alt={`${portalName} Logo`}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-900/20 rounded-full"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl md:w-64 font-extrabold bg-gradient-to-r from-yellow-400 to-red-600 bg-clip-text text-transparent">
                {portalName}
              </span>
              <span className="text-xs text-gray-400">
                Secure • Transparent • Reliable
              </span>
            </div>
          </Link>

          <div className="lg:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-full text-yellow-400 hover:bg-gray-700 focus:outline-none transition-colors duration-300"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

          <div className="hidden lg:flex items-center space-x-2">
            {user ? (
              <>
                <div className="flex items-center space-x-1">
                  {links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`relative group flex items-center text-sm px-3 py-2 rounded-md transition-all duration-300 ${
                        pathname === link.href
                          ? "bg-gray-700 text-yellow-400 shadow-md"
                          : "text-gray-200 hover:bg-gray-700/70 hover:text-yellow-400"
                      }`}
                    >
                      <span className="mr-2">{link.icon}</span>
                      <span>{link.label}</span>
                      {pathname === link.href && (
                        <span className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-yellow-400 to-red-500"></span>
                      )}
                    </Link>
                  ))}
                </div>

                <div className="h-8 w-px bg-gray-600 mx-2"></div>

                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={toggleDropdown}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-300 ${
                      isDropdownOpen
                        ? "bg-gray-700 text-yellow-400"
                        : "text-gray-200 hover:bg-gray-700/70 hover:text-yellow-400"
                    }`}
                    aria-expanded={isDropdownOpen}
                    aria-haspopup="true"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-red-600 flex items-center justify-center text-gray-900 font-bold text-sm">
                      {user.full_name.charAt(0)}
                    </div>
                    <span className="max-w-[120px] truncate">
                      {user.full_name}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-300 ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-md shadow-2xl origin-top-right transition-all duration-300 animate-fadeIn">
                      <div className="bg-gray-800 border border-gray-700 rounded-md">
                        <div className="p-4 border-b border-gray-700">
                          <p className="text-sm font-medium text-gray-300">
                            {user.full_name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {isAdmin ? "Administrator" : "Voter"}
                          </p>
                        </div>
                        <div className="p-2">
                          <button
                            className="w-full text-left flex items-center space-x-2 px-3 py-2 rounded-md text-red-400 hover:bg-gray-700 transition-colors duration-300"
                            onClick={handleLogout}
                          >
                            <LogOut size={16} />
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                {isAdmin ? (
                  <Link
                    href="/login"
                    className="flex items-center space-x-2 text-sm font-medium px-4 py-2 rounded-md border border-yellow-500/30 bg-gray-800 text-yellow-400 hover:bg-gray-700 transition-all duration-300"
                  >
                    <User size={16} />
                    <span>Login</span>
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/register"
                      className="flex items-center space-x-2 text-sm font-medium px-4 py-2 rounded-md bg-gradient-to-r from-yellow-500 to-yellow-400 text-gray-900 hover:from-yellow-400 hover:to-yellow-500 shadow-md transition-all duration-300"
                    >
                      <UserPlus size={16} />
                      <span>Register</span>
                    </Link>
                    <Link
                      href="/login"
                      className="flex items-center space-x-2 text-sm font-medium px-4 py-2 rounded-md border border-yellow-500/30 bg-gray-800 text-yellow-400 hover:bg-gray-700 transition-all duration-300"
                    >
                      <User size={16} />
                      <span>Login</span>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-gray-900/95 backdrop-blur-sm flex flex-col animate-fadeIn">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <Link
                href={homeHref}
                className="flex items-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <img
                  className="h-10 mr-3"
                  src="/logo.png"
                  alt={`${portalName} Logo`}
                />
                <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-red-600 bg-clip-text text-transparent">
                  {portalName}
                </span>
              </Link>
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-full text-yellow-400 hover:bg-gray-700 focus:outline-none"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {user ? (
                <>
                  <div className="mb-6 p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-red-600 flex items-center justify-center text-gray-900 font-bold text-lg">
                        {user.full_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-200">
                          {user.full_name}
                        </p>
                        <p className="text-sm text-gray-400">
                          {isAdmin ? "Administrator" : "Voter"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center text-base py-3 px-4 rounded-md ${
                          pathname === link.href
                            ? "bg-gradient-to-r from-gray-700 to-gray-600 text-yellow-400"
                            : "text-gray-200 hover:bg-gray-800 hover:text-yellow-400"
                        } transition-colors duration-300`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span className="mr-3">{link.icon}</span>
                        <span>{link.label}</span>
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-4 mt-8">
                  {isAdmin ? (
                    <Link
                      href="/login"
                      className="flex items-center justify-center gap-2 text-base font-medium p-3 rounded-md bg-gradient-to-r from-gray-700 to-gray-600 text-yellow-400 hover:from-gray-600 hover:to-gray-500"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User size={20} />
                      <span>Login</span>
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/register"
                        className="flex items-center justify-center gap-2 text-base font-medium p-3 rounded-md bg-gradient-to-r from-yellow-500 to-yellow-400 text-gray-900 hover:from-yellow-400 hover:to-yellow-500"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <UserPlus size={20} />
                        <span>Register</span>
                      </Link>
                      <Link
                        href="/login"
                        className="flex items-center justify-center gap-2 text-base font-medium p-3 rounded-md bg-gradient-to-r from-gray-700 to-gray-600 text-yellow-400 hover:from-gray-600 hover:to-gray-500"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <User size={20} />
                        <span>Login</span>
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {user && (
              <div className="p-4 border-t border-gray-700">
                <button
                  className="flex items-center justify-center w-full gap-2 text-base p-3 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors duration-300"
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        )}
      </nav>

      {showLogoutMessage && <LogoutMessage />}
    </>
  );
}
