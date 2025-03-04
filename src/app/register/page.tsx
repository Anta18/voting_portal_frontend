'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { NoAuthGuard } from '../components/NoAuthGuard';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    full_name: '',
    voter_document: '',
    dob: '',
    address: '',
    username: '',
    password: '',
    confirm_password: ''
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    
    try {
      const res = await fetch(`${API_URL}/voter/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          full_name: formData.full_name,
          voter_document: formData.voter_document,
          dob: formData.dob,
          address: formData.address,
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Registration failed. Please try again.');
      } else {
        console.log('Registration data:', data);

        // If your API returns an access token and user details, store them
        if (data.access_token && data.user) {
          localStorage.setItem('accessToken', data.access_token);
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('userRole', JSON.stringify(data.user.role));
        window.dispatchEvent(new Event('storage'));
          router.push('/dashboard');
        } else {
          setError('Failed to authenticate. Try logging in.');
        }
      }
    } catch (err) {
      setError('Registration failed. Please try again later.');
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
          className="bg-gray-800 shadow-2xl rounded-3xl p-10 w-full mx-20 flex flex-col md:flex-row justify-between items-center"
        >
          {/* Left Section */}
          <div className="w-full md:w-1/2 mb-8 md:mb-0 flex flex-col items-center justify-center">
            <div className="text-center mb-8">
              <h1 className="text-5xl font-extrabold text-white tracking-wide">
                Join Our
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

          {/* Right Section: Registration Form */}
          <div className="w-full md:w-1/2 md:pl-10 flex justify-center">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-gray-700 p-10 rounded-2xl shadow-lg w-full max-w-4xl border border-gray-600"
            >
              <h3 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent">
                Voter Registration
              </h3>
              {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
              <form className="space-y-6" onSubmit={handleRegister}>
                {/* Row 1: Full Name & Voter Document */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white mb-2 font-semibold">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-500 bg-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition duration-200"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2 font-semibold">
                      Voter Document (ID/Roll No)
                    </label>
                    <input
                      type="text"
                      name="voter_document"
                      value={formData.voter_document}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-500 bg-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition duration-200"
                      placeholder="Enter your voter ID or roll number"
                      required
                    />
                  </div>
                </div>

                {/* Row 2: Date of Birth & Address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white mb-2 font-semibold">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-500 bg-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2 font-semibold">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-500 bg-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition duration-200"
                      placeholder="Enter your address"
                      required
                    />
                  </div>
                </div>

                {/* Row 3: Username (full width) */}
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
                    placeholder="Choose a username"
                    required
                  />
                </div>

                {/* Row 4: Password & Confirm Password */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      placeholder="Create a password"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2 font-semibold">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      name="confirm_password"
                      value={formData.confirm_password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-500 bg-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition duration-200"
                      placeholder="Confirm your password"
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="w-full bg-yellow-400 text-gray-900 text-lg py-3 rounded-xl hover:bg-yellow-500 transition duration-300 mt-6"
                  disabled={loading}
                >
                  {loading ? "Registering..." : "Register"}
                </motion.button>
              </form>

              {/* Footer Link */}
              <div className="text-center mt-8">
                <p className="text-gray-400">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-yellow-400 hover:underline font-medium"
                  >
                    Login here
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
