'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { NoAuthGuard } from '../components/NoAuthGuard';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Use your backend URL from env variable
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
  
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
  
      if (!res.ok) {
        setError(data.error || 'Login failed. Please try again.');
      } else {
        // Save access token and user details to localStorage
        localStorage.setItem('accessToken', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('userRole', JSON.stringify(data.user.role));
        window.dispatchEvent(new Event('storage'));
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Login failed. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <NoAuthGuard>
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-8 bg-gradient-to-br from-gray-900 to-gray-800">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gray-800 shadow-2xl rounded-3xl p-10 w-full max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center"
      >
        {/* Left Section */}
        <div className="w-full md:w-1/2 mb-8 md:mb-0 flex flex-col items-center justify-center">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-extrabold text-white tracking-wide">
              Welcome to
            </h1>
          </div>
          <div className="relative w-52 h-52">
            <Image 
              src="/logo.png" 
              alt="Voter System Logo" 
              fill
              style={{ objectFit: 'contain' }}
            />
          </div>
          <h2 className="text-4xl font-semibold mt-6 bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent">
            Voter System
          </h2>
        </div>

        {/* Right Section: Login Form */}
        <div className="w-full md:w-1/2 md:pl-10 flex justify-center">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-gray-700 p-10 rounded-2xl shadow-lg w-full max-w-md border border-gray-600"
          >
            <h3 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent">
              Voter Login
            </h3>
            {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
            <form className="space-y-6" onSubmit={handleLogin}>
              {/* Username Field */}
              <div>
                <label className="block text-white mb-2 font-semibold">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-500 bg-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition duration-200"
                  placeholder="Enter your username"
                  required
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-white mb-2 font-semibold">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-500 bg-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition duration-200"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="w-full bg-yellow-400 text-gray-900 text-lg py-3 rounded-xl hover:bg-yellow-500 transition duration-300"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </motion.button>
            </form>

            {/* Footer Link */}
            <div className="text-center mt-8">
              <p className="text-gray-400">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="text-yellow-400 hover:underline font-medium"
                >
                  Register here
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
    </NoAuthGuard>
  );
}
