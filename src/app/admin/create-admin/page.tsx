'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateAdminPage() {
  const [formData, setFormData] = useState({ full_name: '', username: '', password: '' });
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('New admin data:', formData);
    setMessage('Admin created successfully!');
    // Optionally, redirect or clear form here.
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-gray-900 text-white flex items-center justify-center p-6">
      <div className="bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-yellow-400 to-red-600 bg-clip-text text-transparent">
          Create New Admin
        </h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="full_name" className="block text-gray-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="full_name"
              id="full_name"
              placeholder="Enter full name"
              onChange={handleChange}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
          </div>
          <div>
            <label htmlFor="username" className="block text-gray-300 mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              id="username"
              placeholder="Enter username"
              onChange={handleChange}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Enter password"
              onChange={handleChange}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-yellow-400 to-red-600 text-gray-900 rounded-md font-bold transition-colors duration-300 hover:from-red-600 hover:to-yellow-400"
          >
            Create Admin
          </button>
        </form>
        {message && (
          <div className="mt-6 text-center">
            <p className="text-green-400 font-semibold">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
