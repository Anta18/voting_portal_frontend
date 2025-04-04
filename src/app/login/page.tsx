"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { NoAuthGuard } from "../components/NoAuthGuard";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed. Please try again.");
      } else {
        // Save access token and user details to localStorage
        localStorage.setItem("accessToken", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("userRole", JSON.stringify(data.user.role));
        window.dispatchEvent(new Event("storage"));
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Login failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <NoAuthGuard>
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-5"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 w-full max-w-6xl mx-6 lg:mx-auto flex flex-col lg:flex-row rounded-3xl overflow-hidden shadow-2xl"
        >
          {/* Left Brand Section */}
          <div className="relative w-full lg:w-1/2 bg-gradient-to-br from-gray-800 to-gray-900 p-12 lg:p-16 flex flex-col items-center justify-center">
            <div className="absolute top-0 left-0 w-full h-full">
              <svg
                className="absolute top-0 left-0 h-full w-full"
                viewBox="0 0 600 600"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g transform="translate(300,300)">
                  <path
                    d="M153.6,-171.2C194.8,-140.3,223.2,-89.5,226,-38.8C228.8,11.9,206,62.5,173.4,100.9C140.9,139.3,98.5,165.5,50.3,184.7C2.1,203.8,-51.9,215.9,-97,199.8C-142.1,183.6,-178.3,139.3,-201.1,88.3C-224,37.3,-233.4,-20.4,-216.4,-68.9C-199.3,-117.4,-155.8,-156.7,-109.4,-184.7C-63,-212.7,-13.5,-229.3,35.4,-225.1C84.3,-220.9,112.4,-202.1,153.6,-171.2Z"
                    fill="rgba(234, 179, 8, 0.07)"
                  />
                </g>
              </svg>
              <svg
                className="absolute bottom-0 right-0 h-3/4 w-3/4 translate-x-1/4 translate-y-1/4"
                viewBox="0 0 600 600"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g transform="translate(300,300)">
                  <path
                    d="M122.4,-118.1C169.9,-72.4,227.6,-36.2,237.4,11.3C247.2,58.8,209,117.6,161.6,159.6C114.1,201.5,57.1,226.8,2.2,224.6C-52.6,222.4,-105.3,192.8,-143.7,150.9C-182.1,109,-206.3,54.5,-203.9,2.4C-201.5,-49.7,-172.5,-99.5,-134.1,-145.2C-95.6,-190.9,-47.8,-232.5,-5.7,-226.8C36.5,-221.1,73,-163.8,122.4,-118.1Z"
                    fill="rgba(220, 38, 38, 0.07)"
                  />
                </g>
              </svg>
            </div>

            {/* Brand Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="relative z-10 flex flex-col items-center"
            >
              <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-wide mb-8">
                Welcome to
              </h1>

              <div className="relative w-40 h-40 lg:w-56 lg:h-56 mb-4">
                <Image
                  src="/logo.png"
                  alt="Voter System Logo"
                  fill
                  priority
                  style={{ objectFit: "contain" }}
                  className="drop-shadow-lg"
                />
              </div>

              <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight mt-4">
                <span className="bg-gradient-to-r from-yellow-400 via-amber-500 to-red-500 bg-clip-text text-transparent">
                  VOTER SYSTEM
                </span>
              </h2>

              <p className="mt-6 text-gray-300 text-center max-w-md">
                Secure, transparent, and efficient electoral management for
                modern democracy.
              </p>
            </motion.div>
          </div>

          {/* Right Login Form Section */}
          <div className="w-full lg:w-1/2 bg-white dark:bg-gray-800 p-8 md:p-12 lg:p-16">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="w-full max-w-md mx-auto"
            >
              <div className="mb-10 text-center">
                <h3 className="text-3xl font-extrabold tracking-tight">
                  <span className="bg-gradient-to-r from-yellow-500 via-amber-500 to-red-500 bg-clip-text text-transparent">
                    Account Login
                  </span>
                </h3>
                <p className="mt-2 text-gray-400">
                  Sign in to access your account
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded"
                >
                  <p className="text-sm font-medium">{error}</p>
                </motion.div>
              )}

              <form className="space-y-6" onSubmit={handleLogin}>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition duration-200"
                      placeholder="Enter your username"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition duration-200"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                </div>

                <div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-md font-medium text-gray-900 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all duration-200"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-900"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Signing in...
                      </span>
                    ) : (
                      "Sign In"
                    )}
                  </motion.button>
                </div>
              </form>

              <div className="mt-8 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Don't have an account?{" "}
                  <Link
                    href="/register"
                    className="font-medium text-amber-600 hover:text-amber-500 transition-colors"
                  >
                    Create an account
                  </Link>
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="absolute bottom-4 text-center w-full text-gray-500 text-xs">
          © 2025 Voter System. All rights reserved.
        </div>
      </div>
    </NoAuthGuard>
  );
}
