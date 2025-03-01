'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Log the registration data
      console.log('Registration data:', formData);
      
      // Redirect to login page
      router.push('/login');
    } catch (err) {
      setError('Registration failed. Please try again later.');
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
            <h1 className="text-4xl font-bold text-white">Join Our</h1>
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

        {/* Right Section: Registration Form */}
        <div className="w-full md:w-1/2 md:pl-8 flex justify-center">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-[#392929] p-8 rounded-2xl shadow-lg w-full max-w-md"
          >
            <h3 className="text-2xl font-bold mb-6 text-center text-white">
              Voter Registration
            </h3>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form className="space-y-4" onSubmit={handleRegister}>
              {/* Full Name */}
              <div>
                <label className="block text-white mb-1 pl-1 font-bold">
                  Full Name
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border-2 border-white bg-white focus:outline-none focus:border-[#FF9321] transition duration-200"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              {/* Voter Document */}
              <div>
                <label className="block text-white mb-1 pl-1 font-bold">
                  Voter Document (ID/Roll No)
                </label>
                <input
                  type="text"
                  name="voter_document"
                  value={formData.voter_document}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border-2 border-white bg-white focus:outline-none focus:border-[#FF9321] transition duration-200"
                  placeholder="Enter your voter ID or roll number"
                  required
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-white mb-1 pl-1 font-bold">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border-2 border-white bg-white focus:outline-none focus:border-[#FF9321] transition duration-200"
                  required
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-white mb-1 pl-1 font-bold">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border-2 border-white bg-white focus:outline-none focus:border-[#FF9321] transition duration-200"
                  placeholder="Enter your address"
                  required
                />
              </div>

              {/* Username */}
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
                  placeholder="Choose a username"
                  required
                />
              </div>

              {/* Password */}
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
                  placeholder="Create a password"
                  required
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-white mb-1 pl-1 font-bold">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border-2 border-white bg-white focus:outline-none focus:border-[#FF9321] transition duration-200"
                  placeholder="Confirm your password"
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
                {loading ? "Registering..." : "Register"}
              </motion.button>
            </form>

            {/* Footer Link */}
            <div className="text-center mt-6">
              <p className="text-gray-400">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-[#FF9321] hover:underline font-medium"
                >
                  Login here
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}