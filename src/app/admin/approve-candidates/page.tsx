"use client";
import { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  User,
  Calendar,
  Flag,
} from "lucide-react";

interface Election {
  name: string;
}

interface Candidate {
  _id: string;
  full_name: string;
  party?: string;
  election_id: string | Election;
  created_at: string;
  status?: string;
}

// Helper function to format date strings
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
};

// Function to get party badge color
const getPartyColor = (party?: string) => {
  if (!party) return "bg-gray-600"; // Independent

  const partyLower = party.toLowerCase();
  if (partyLower.includes("bjp")) return "bg-orange-600";
  if (partyLower.includes("inc")) return "bg-blue-600";
  return "bg-purple-600"; // Others
};

export default function ApproveCandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Set the default filter (you can change it as needed)
  const [selectedTab, setSelectedTab] = useState("BJP");
  const [searchTerm, setSearchTerm] = useState("");
  const backendUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!backendUrl) {
      setError("Backend URL is not defined");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    fetch(`${backendUrl}/candidate/admin/pending`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error fetching candidates");
        }
        return response.json();
      })
      .then((data) => {
        setCandidates(data.candidates);
        setIsLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setIsLoading(false);
      });
  }, [backendUrl]);

  const handleApprove = (id: string) => {
    if (!backendUrl) return;

    // Optimistic UI update
    setCandidates((prev) =>
      prev.map((candidate) =>
        candidate._id === id
          ? { ...candidate, status: "processing" }
          : candidate
      )
    );

    fetch(`${backendUrl}/candidate/admin/approve/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error approving candidate");
        }
        return response.json();
      })
      .then(() => {
        setCandidates((prev) =>
          prev.filter((candidate) => candidate._id !== id)
        );
      })
      .catch((error) => {
        setError(error.message);
        // Revert the optimistic update
        setCandidates((prev) =>
          prev.map((candidate) =>
            candidate._id === id
              ? { ...candidate, status: undefined }
              : candidate
          )
        );
      });
  };

  const handleReject = (id: string) => {
    if (!backendUrl) return;

    // Optimistic UI update
    setCandidates((prev) =>
      prev.map((candidate) =>
        candidate._id === id
          ? { ...candidate, status: "processing" }
          : candidate
      )
    );

    fetch(`${backendUrl}/candidate/admin/reject/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error rejecting candidate");
        }
        return response.json();
      })
      .then(() => {
        setCandidates((prev) =>
          prev.filter((candidate) => candidate._id !== id)
        );
      })
      .catch((error) => {
        setError(error.message);
        // Revert the optimistic update
        setCandidates((prev) =>
          prev.map((candidate) =>
            candidate._id === id
              ? { ...candidate, status: undefined }
              : candidate
          )
        );
      });
  };

  // Helper to display election name regardless of its type
  const getElectionName = (election: string | Election) => {
    return typeof election === "string" ? election : election.name;
  };

  // Filter candidates based on search term and selected tab
  const filteredCandidates = candidates.filter((candidate) => {
    const lowerSearch = searchTerm.toLowerCase();
    const matchesSearch =
      searchTerm === "" ||
      candidate.full_name.toLowerCase().includes(lowerSearch) ||
      (candidate.party || "Independent").toLowerCase().includes(lowerSearch) ||
      getElectionName(candidate.election_id)
        .toLowerCase()
        .includes(lowerSearch);

    // Filter based on party selection
    const candidateParty = candidate.party ? candidate.party.toLowerCase() : "";
    if (selectedTab === "BJP") {
      return candidate.party && candidateParty.includes("bjp") && matchesSearch;
    }
    if (selectedTab === "INC") {
      return candidate.party && candidateParty.includes("inc") && matchesSearch;
    }
    if (selectedTab === "independent") {
      return (
        (!candidate.party || candidate.party.trim() === "") && matchesSearch
      );
    }
    if (selectedTab === "others") {
      return (
        candidate.party &&
        !candidateParty.includes("bjp") &&
        !candidateParty.includes("inc") &&
        matchesSearch
      );
    }
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with statistics */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-red-700 bg-clip-text text-transparent mb-4 md:mb-0">
            Candidate Verification Dashboard
          </h1>

          <div className="flex space-x-4">
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-xl px-4 py-2 border border-gray-700">
              <p className="font-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                Pending
              </p>
              <p className="text-2xl font-bold">{candidates.length}</p>
            </div>
          </div>
        </div>

        {/* Search and filter bar */}
        <div className="bg-gray-800 bg-opacity-60 backdrop-blur-sm rounded-xl p-4 mb-6 border border-gray-700 shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-1/2">
              <input
                type="text"
                placeholder="Search candidates, parties, or elections..."
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            <div className="flex space-x-2 w-full md:w-auto overflow-x-auto pb-1">
              <button
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedTab === "BJP"
                    ? "bg-orange-600 text-white"
                    : "bg-gray-900 text-gray-400 hover:bg-gray-700"
                }`}
                onClick={() => setSelectedTab("BJP")}
              >
                BJP
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedTab === "INC"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-900 text-gray-400 hover:bg-gray-700"
                }`}
                onClick={() => setSelectedTab("INC")}
              >
                INC
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedTab === "independent"
                    ? "bg-gray-600 text-white"
                    : "bg-gray-900 text-gray-400 hover:bg-gray-700"
                }`}
                onClick={() => setSelectedTab("independent")}
              >
                Independent
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedTab === "others"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-900 text-gray-400 hover:bg-gray-700"
                }`}
                onClick={() => setSelectedTab("others")}
              >
                Others
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="bg-gray-800 bg-opacity-60 backdrop-blur-sm rounded-xl border border-gray-700 shadow-2xl overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-red-400">
                  Error Loading Candidates
                </h3>
                <p className="text-gray-400 mt-2">{error}</p>
              </div>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-300">
                  No Pending Candidates
                </h3>
                <p className="text-gray-400 mt-2">
                  {searchTerm
                    ? "No candidates match your search."
                    : "All candidates have been processed."}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-900 text-gray-300 text-left">
                    <th className="px-6 py-4 text-sm font-semibold tracking-wider">
                      Candidate
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold tracking-wider">
                      Party
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold tracking-wider">
                      Election
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold tracking-wider">
                      Applied
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold tracking-wider text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredCandidates.map((candidate) => (
                    <tr
                      key={candidate._id}
                      className={`hover:bg-gray-700 transition-colors ${
                        candidate.status === "processing" ? "opacity-50" : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 mr-3 bg-gradient-to-br from-purple-600 to-blue-500 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium">{candidate.full_name}</p>
                            <p className="text-xs text-gray-400">
                              ID: {candidate._id.substring(0, 8)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPartyColor(
                            candidate.party
                          )} text-white`}
                        >
                          <Flag className="h-3 w-3 mr-1" />
                          {candidate.party || "Independent"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          {getElectionName(candidate.election_id)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-300">
                          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                          {formatDate(candidate.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-3">
                          <button
                            onClick={() => handleApprove(candidate._id)}
                            disabled={candidate.status === "processing"}
                            className={`px-4 py-2 rounded-lg font-medium flex items-center bg-gradient-to-r from-green-500 to-emerald-600 text-white transform hover:scale-105 transition duration-200 ${
                              candidate.status === "processing"
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(candidate._id)}
                            disabled={candidate.status === "processing"}
                            className={`px-4 py-2 rounded-lg font-medium flex items-center bg-gradient-to-r from-red-500 to-red-600 text-white transform hover:scale-105 transition duration-200 ${
                              candidate.status === "processing"
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
