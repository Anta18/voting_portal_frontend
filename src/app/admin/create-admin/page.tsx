"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateAdminPage() {
  const [formData, setFormData] = useState({
    full_name: "",
    dob: "",
    address: "",
    username: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await fetch("/admin/create_admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Assumes JWT is stored in localStorage
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create admin");
      }

      setMessage("Admin created successfully!");
      setFormData({
        full_name: "",
        dob: "",
        address: "",
        username: "",
        password: "",
      });

      // Optionally, redirect
      setTimeout(() => router.push("/admin/dashboard"), 2000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-gray-900 text-white flex items-center justify-center px-6 pt-6 pb-2">
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
              value={formData.full_name}
              onChange={handleChange}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
          </div>
          <div>
            <label htmlFor="dob" className="block text-gray-300 mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              name="dob"
              id="dob"
              value={formData.dob}
              onChange={handleChange}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
          </div>
          <div>
            <label htmlFor="address" className="block text-gray-300 mb-1">
              Address
            </label>
            <input
              type="text"
              name="address"
              id="address"
              placeholder="Enter address"
              value={formData.address}
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
              value={formData.username}
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
              value={formData.password}
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
        {error && (
          <div className="mt-6 text-center">
            <p className="text-red-400 font-semibold">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
