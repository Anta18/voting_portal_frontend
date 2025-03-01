'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, just log and redirect
      console.log('Logged in as:', formData.username);
      router.push('/dashboard');
    } catch (err) {
      setError('Login failed. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-2 py-4 lg:px-8 md:px-8 lg:py-8 md:py-8 bg-[#322323]">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-[#493939] shadow-2xl rounded-3xl p-8 w-full max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center"
      >
        {/* Left Section */}
        <div className="w-full md:w-1/2 mb-8 md:mb-0 flex flex-col items-center justify-center">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white">Welcome to</h1>
          </div>
          <div className="relative w-48 h-48">
            {/* Replace with your logo */}
            <Image 
              src="/logo.png" 
              alt="Voter System Logo" 
              fill
              style={{ objectFit: 'contain' }}
            />
          </div>
          <h2 className="text-3xl font-semibold text-[#FF9321] mt-4">
            Voter System
          </h2>
        </div>

        {/* Right Section: Login Form */}
        <div className="w-full md:w-1/2 md:pl-8 flex justify-center">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-[#392929] p-8 rounded-2xl shadow-lg w-full max-w-md"
          >
            <h3 className="text-2xl font-bold mb-6 text-center text-white">
              Voter Login
            </h3>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form className="space-y-4" onSubmit={handleLogin}>
              {/* Username Field */}
              <div>
                <label className="block text-white mb-1 pl-1 font-bold">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border-2 border-white bg-white focus:outline-none focus:border-[#FF9321] transition duration-200"
                  placeholder="Enter your username"
                  required
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-white mb-1 pl-1 font-bold">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border-2 border-white bg-white focus:outline-none focus:border-[#FF9321] transition duration-200"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="w-full bg-[#FF9321] text-white text-lg py-2 rounded-xl hover:bg-[#e6821e] transition duration-300 mt-6"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </motion.button>
            </form>

            {/* Footer Link */}
            <div className="text-center mt-6">
              <p className="text-gray-400">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="text-[#FF9321] hover:underline font-medium"
                >
                  Register here
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}