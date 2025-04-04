"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface Election {
  _id: string;
  name: string;
  // include other properties if needed
}

interface FormData {
  full_name: string;
  party: string;
  manifesto: string;
  documents: string;
}

export default function CandidateRegistrationPage() {
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElection, setSelectedElection] = useState<Election | null>(
    null
  );
  const [formData, setFormData] = useState<FormData>({
    full_name: "",
    party: "",
    manifesto: "",
    documents: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  // Fetch eligible elections on component mount
  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    async function fetchElections() {
      try {
        const res = await fetch(`${API_URL}/election/eligible_for_candidate`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        if (!res.ok) {
          throw new Error("Failed to fetch elections");
        }
        const data = await res.json();
        setElections(data.eligible_elections);
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching elections");
      }
    }
    fetchElections();
  }, []);

  const handleElectionSelect = (election: Election) => {
    setSelectedElection(election);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCandidateRegister = async (e: React.FormEvent) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    e.preventDefault();
    if (!selectedElection) {
      setError("Please select an election");
      return;
    }
    setLoading(true);
    setError("");
    const data = {
      election_id: selectedElection._id,
      ...formData,
    };
    try {
      const res = await fetch(`${API_URL}/candidate/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Registration failed");
      }
      // Successful registration: redirect or show success message
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header with animated gradient */}
      <div className="py-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-800 via-red-600 to-yellow-500 opacity-20"></div>
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-4xl font-extrabold text-center">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600">
              Election Candidate Registration
            </span>
          </h1>
          <p className="text-center mt-3 text-gray-300 max-w-2xl mx-auto">
            Take the first step towards your political journey by registering as
            a candidate for an upcoming election.
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-6 pb-16 mt-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar: Election List */}
          <div className="lg:w-1/3">
            <div className="backdrop-blur-md bg-gray-900/50 rounded-2xl shadow-xl border border-gray-800 p-6 h-full">
              <h2 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-red-500">
                Available Elections
              </h2>

              {error && (
                <div className="mb-6 p-4 bg-red-900/40 border border-red-700 rounded-lg">
                  <p className="text-red-400">{error}</p>
                </div>
              )}

              {elections.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 bg-gray-800/50 rounded-xl border border-gray-700">
                  <p className="text-gray-400">No elections available</p>
                </div>
              ) : (
                <div className="space-y-3 mt-6">
                  {elections.map((election) => (
                    <motion.div
                      key={election._id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleElectionSelect(election)}
                      className={`cursor-pointer p-4 rounded-xl transition-all duration-300 ${
                        selectedElection &&
                        selectedElection._id === election._id
                          ? "bg-gradient-to-r from-yellow-500 to-red-600 shadow-lg shadow-red-600/20"
                          : "bg-gray-800/60 hover:bg-gray-700/60 border border-gray-700 hover:border-gray-600"
                      }`}
                    >
                      <div
                        className={`font-medium ${
                          selectedElection &&
                          selectedElection._id === election._id
                            ? "text-gray-900"
                            : "text-white"
                        }`}
                      >
                        {election.name}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              <div className="mt-8 p-4 bg-blue-900/20 border border-blue-800/30 rounded-lg">
                <h3 className="text-blue-400 font-medium mb-2">
                  Why Register?
                </h3>
                <p className="text-sm text-gray-300">
                  By becoming a candidate, you can represent your community,
                  advocate for policies you believe in, and make a meaningful
                  impact in the democratic process.
                </p>
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <div className="lg:w-2/3">
            {selectedElection ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="backdrop-blur-md bg-gray-900/50 rounded-2xl shadow-xl border border-gray-800 p-8"
              >
                <div className="mb-8 text-center">
                  <h2 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500">
                    Candidate Registration
                  </h2>
                  <div className="flex items-center justify-center">
                    <div className="h-1 w-16 bg-gradient-to-r from-yellow-400 to-red-600 rounded-full"></div>
                  </div>
                  <p className="mt-4 text-gray-300">
                    Registering for:{" "}
                    <span className="font-semibold text-white">
                      {selectedElection.name}
                    </span>
                  </p>
                </div>

                <form onSubmit={handleCandidateRegister} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label
                        htmlFor="full_name"
                        className="block text-sm font-medium text-gray-300"
                      >
                        Full Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="full_name"
                          id="full_name"
                          placeholder="Enter your full name"
                          value={formData.full_name}
                          onChange={handleChange}
                          className="w-full p-3 bg-gray-800/80 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent transition-all duration-300"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="party"
                        className="block text-sm font-medium text-gray-300"
                      >
                        Political Party
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="party"
                          id="party"
                          placeholder="Enter your party affiliation"
                          value={formData.party}
                          onChange={handleChange}
                          className="w-full p-3 bg-gray-800/80 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent transition-all duration-300"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="manifesto"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Manifesto
                    </label>
                    <textarea
                      name="manifesto"
                      id="manifesto"
                      placeholder="Outline your vision, policies, and goals"
                      value={formData.manifesto}
                      onChange={handleChange}
                      className="w-full p-4 bg-gray-800/80 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent transition-all duration-300"
                      rows={6}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Share your vision for the future and key policy positions.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="documents"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Supporting Documents
                    </label>
                    <input
                      type="text"
                      name="documents"
                      id="documents"
                      placeholder="Enter URL to your supporting documents or credentials"
                      value={formData.documents}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-800/80 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent transition-all duration-300"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Optional: Link to your CV, previous work, or other
                      relevant materials.
                    </p>
                  </div>

                  <div className="pt-4">
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-4 bg-gradient-to-r from-yellow-500 via-red-500 to-pink-600 text-white rounded-lg font-bold shadow-lg shadow-red-600/20 transition-all duration-300 hover:from-yellow-400 hover:to-red-600 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                          Processing Submission...
                        </div>
                      ) : (
                        "Submit Candidate Registration"
                      )}
                    </motion.button>

                    <p className="text-center text-sm text-gray-400 mt-4">
                      By registering, you agree to abide by the election code of
                      conduct and rules.
                    </p>
                  </div>
                </form>
              </motion.div>
            ) : (
              <div className="backdrop-blur-md bg-gray-900/50 rounded-2xl shadow-xl border border-gray-800 p-8 flex flex-col items-center justify-center min-h-96">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-yellow-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7l4-4m0 0l4 4m-4-4v18"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-center mb-2">
                  Select an Election
                </h3>
                <p className="text-gray-400 text-center max-w-md">
                  Please select an available election from the list to begin
                  your candidate registration process.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
