"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { NoAuthGuard } from "../components/NoAuthGuard";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    full_name: "",
    voter_document: "",
    dob: "",
    address: "",
    username: "",
    password: "",
    confirm_password: "",
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/voter/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
        setError(data.error || "Registration failed. Please try again.");
      } else {
        console.log("Registration data:", data);

        if (data.access_token && data.user) {
          localStorage.setItem("accessToken", data.access_token);
          localStorage.setItem("user", JSON.stringify(data.user));
          localStorage.setItem("userRole", JSON.stringify(data.user.role));
          window.dispatchEvent(new Event("storage"));
          router.push("/dashboard");
        } else {
          setError("Failed to authenticate. Try logging in.");
        }
      }
    } catch (err) {
      setError("Registration failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <NoAuthGuard>
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-auto">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-5"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 w-full max-w-7xl mx-6 lg:mx-auto my-8 flex flex-col lg:flex-row rounded-3xl overflow-hidden shadow-2xl"
        >
          {/* Left Brand Section */}
          <div className="relative w-full lg:w-2/5 bg-gradient-to-br from-gray-800 to-gray-900 p-12 flex flex-col items-center justify-center">
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
                Join Our
              </h1>

              <div className="relative w-32 h-32 lg:w-44 lg:h-44 mb-4">
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
                Join our secure and transparent electoral system. Register to
                participate in the democratic process.
              </p>
            </motion.div>
          </div>

          {/* Right Registration Form Section */}
          <div className="w-full lg:w-3/5 bg-white dark:bg-gray-800 p-8 md:p-12">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="w-full max-w-3xl mx-auto"
            >
              <div className="mb-8 text-center">
                <h3 className="text-3xl font-extrabold tracking-tight">
                  <span className="bg-gradient-to-r from-yellow-500 via-amber-500 to-red-500 bg-clip-text text-transparent">
                    Create Your Account
                  </span>
                </h3>
                <p className="mt-2 text-gray-400">
                  Register to participate in the electoral process
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

              <form className="space-y-6" onSubmit={handleRegister}>
                {/* Personal Information Section */}
                <div className="space-y-1 mb-2">
                  <h4 className="text-lg font-medium text-gray-200 border-b border-gray-700 pb-2 mb-4">
                    Personal Information
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Full Name Field */}
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Full Name
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg
                            className="h-5 w-5 text-gray-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition duration-200 shadow-sm"
                          placeholder="Enter your full name"
                          required
                        />
                        <div className="absolute inset-0 rounded-lg border-2 border-transparent group-focus-within:border-yellow-500 pointer-events-none"></div>
                      </div>
                    </div>

                    {/* Voter Document Field */}
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Voter Document (ID/Roll No)
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg
                            className="h-5 w-5 text-gray-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2h1v1H4v-1h1v-2a7.001 7.001 0 0113 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <input
                          type="text"
                          name="voter_document"
                          value={formData.voter_document}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition duration-200 shadow-sm"
                          placeholder="Enter your voter ID/roll number"
                          required
                        />
                        <div className="absolute inset-0 rounded-lg border-2 border-transparent group-focus-within:border-yellow-500 pointer-events-none"></div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Date of Birth Field */}
                    <div className="space-y-1">
                      <label
                        htmlFor="dob"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Date of Birth
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg
                            className="h-5 w-5 text-gray-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <input
                          id="dob"
                          type="date"
                          name="dob"
                          value={formData.dob}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition duration-200 shadow-sm"
                          required
                        />
                        <div className="absolute inset-0 rounded-lg border-2 border-transparent group-focus-within:border-yellow-500 pointer-events-none"></div>
                      </div>
                    </div>

                    {/* Address Field */}
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Address
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg
                            className="h-5 w-5 text-gray-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition duration-200 shadow-sm"
                          placeholder="Enter your address"
                          required
                        />
                        <div className="absolute inset-0 rounded-lg border-2 border-transparent group-focus-within:border-yellow-500 pointer-events-none"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Information Section */}
                <div className="space-y-1 pt-2">
                  <h4 className="text-lg font-medium text-gray-200 border-b border-gray-700 pb-2 mb-4">
                    Account Information
                  </h4>

                  {/* Username Field */}
                  <div className="space-y-1 mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Username
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="h-5 w-5 text-gray-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition duration-200 shadow-sm"
                        placeholder="Choose a username"
                        required
                      />
                      <div className="absolute inset-0 rounded-lg border-2 border-transparent group-focus-within:border-yellow-500 pointer-events-none"></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Password Field */}
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Password
                      </label>
                      <div className="relative group">
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
                          className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition duration-200 shadow-sm"
                          placeholder="Create a password"
                          required
                        />
                        <div className="absolute inset-0 rounded-lg border-2 border-transparent group-focus-within:border-yellow-500 pointer-events-none"></div>
                      </div>
                    </div>

                    {/* Confirm Password Field */}
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Confirm Password
                      </label>
                      <div className="relative group">
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
                          name="confirm_password"
                          value={formData.confirm_password}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition duration-200 shadow-sm"
                          placeholder="Confirm your password"
                          required
                        />
                        <div className="absolute inset-0 rounded-lg border-2 border-transparent group-focus-within:border-yellow-500 pointer-events-none"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-md font-medium text-gray-900 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all duration-200"
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
                        Creating Account...
                      </span>
                    ) : (
                      "Create Account"
                    )}
                  </motion.button>
                </div>
              </form>

              {/* Footer Link */}
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-medium text-amber-600 hover:text-amber-500 transition-colors"
                  >
                    Sign in instead
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
