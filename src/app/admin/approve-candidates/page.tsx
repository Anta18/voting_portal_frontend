"use client";
import { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  User,
  Calendar,
  Flag,
  Eye,
} from "lucide-react";

// Define interfaces
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
  manifesto?: string; // Added manifesto property
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
  if (!party) return "bg-green-600"; // Independent
  const partyLower = party.toLowerCase();
  if (partyLower.includes("bjp")) return "bg-orange-600";
  if (partyLower.includes("inc")) return "bg-blue-600";
  return "bg-purple-600"; // Others
};

// Helper function to display election name
const getElectionName = (election: string | Election) => {
  return typeof election === "string" ? election : election.name;
};

// DetailsModal component with candidate deapproval option
interface DetailsModalProps {
  title: string;
  data: Candidate;
  modalType: string;
  onClose: () => void;
  onDeapproved?: () => void;
}

const DetailsModal: React.FC<DetailsModalProps> = ({
  title,
  data,
  modalType,
  onClose,
  onDeapproved,
}) => {
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [deapprovalError, setDeapprovalError] = useState<string>("");

  const handleConfirmDeapprove = async () => {
    setIsSubmitting(true);
    setDeapprovalError("");
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/candidate/admin/deapprove/${data._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to deapprove candidate");
      }
      if (onDeapproved) onDeapproved();
      setShowConfirm(false);
      onClose();
    } catch (err: any) {
      console.error(err);
      setDeapprovalError(err.message || "Error deapproving candidate");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50 p-4">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-gray-800 text-white rounded-lg shadow-xl w-11/12 md:w-2/3 lg:w-1/2 max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            X
          </button>
        </div>
        <div className="flex-1 overflow-auto p-6">
          <div className="mb-6 bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">{data.full_name}</h3>
            {data.party && <p className="text-gray-300">Party: {data.party}</p>}
            <p className="text-xs text-gray-400">
              ID: {data._id.substring(0, 8)}
            </p>
            {data.status && (
              <div className="mt-2">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    data.status.toLowerCase() === "approved"
                      ? "bg-green-800 text-green-200"
                      : data.status.toLowerCase() === "pending"
                      ? "bg-yellow-800 text-yellow-200"
                      : "bg-red-800 text-red-200"
                  }`}
                >
                  {data.status.toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="bg-gray-700 p-4 rounded-lg overflow-auto max-h-96">
            <pre className="text-sm whitespace-pre-wrap break-words">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
          {data.manifesto && (
            <div className="mt-6 bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Manifesto</h3>
              <p className="text-gray-300 whitespace-pre-wrap">
                {data.manifesto}
              </p>
            </div>
          )}
          {/* Candidate-specific deapproval option */}
          {modalType === "candidate" &&
            data.status?.toLowerCase() === "approved" && (
              <div className="mt-6">
                {!showConfirm ? (
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="w-full bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-500 transition"
                  >
                    Deapprove Candidate
                  </button>
                ) : (
                  <div className="bg-red-900 p-4 rounded-lg">
                    <p className="mb-4">
                      Are you sure you want to deapprove this candidate?
                    </p>
                    {deapprovalError && (
                      <p className="text-red-300 mb-4">{deapprovalError}</p>
                    )}
                    <div className="flex justify-end">
                      <button
                        onClick={() => setShowConfirm(false)}
                        className="mr-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-400 transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleConfirmDeapprove}
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition"
                      >
                        {isSubmitting ? "Deapproving..." : "Confirm"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
        </div>
        <div className="flex justify-end items-center p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors ml-auto"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ApproveCandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Default filter now set to "All"
  const [selectedTab, setSelectedTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    data: Candidate | null;
    type: string;
  }>({
    isOpen: false,
    title: "",
    data: null,
    type: "",
  });
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

  // Filter candidates based on search term and selected tab
  const filteredCandidates = candidates.filter((candidate) => {
    const lowerSearch = searchTerm.toLowerCase();
    const matchesSearch =
      searchTerm === "" ||
      candidate.full_name.toLowerCase().includes(lowerSearch) ||
      (candidate.party || "independent").toLowerCase().includes(lowerSearch) ||
      getElectionName(candidate.election_id)
        .toLowerCase()
        .includes(lowerSearch);

    // Filter based on selected tab
    if (selectedTab === "BJP") {
      return candidate.party?.toLowerCase().includes("bjp") && matchesSearch;
    }
    if (selectedTab === "INC") {
      return candidate.party?.toLowerCase().includes("inc") && matchesSearch;
    }
    if (selectedTab === "independent") {
      return (
        (!candidate.party || candidate.party.trim() === "") && matchesSearch
      );
    }
    if (selectedTab === "others") {
      const candidateParty = candidate.party
        ? candidate.party.toLowerCase()
        : "";
      return (
        candidate.party &&
        !candidateParty.includes("bjp") &&
        !candidateParty.includes("inc") &&
        matchesSearch
      );
    }
    // When "All" is selected, return all candidates matching search term
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
                  selectedTab === "All"
                    ? "bg-green-600 text-white"
                    : "bg-gray-900 text-gray-400 hover:bg-gray-700"
                }`}
                onClick={() => setSelectedTab("All")}
              >
                All
              </button>
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
                    ? "bg-green-600 text-white"
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
                          <button
                            onClick={() =>
                              setModalState({
                                isOpen: true,
                                title: "Candidate Details",
                                data: candidate,
                                type: "candidate",
                              })
                            }
                            className="text-indigo-400 hover:text-indigo-300 ml-2"
                          >
                            <Eye size={18} />
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

      {/* Modal */}
      {modalState.isOpen && modalState.data && (
        <DetailsModal
          title={modalState.title}
          data={modalState.data}
          modalType={modalState.type}
          onClose={() =>
            setModalState({ isOpen: false, title: "", data: null, type: "" })
          }
          onDeapproved={
            modalState.type === "candidate"
              ? () => {
                  // Refresh candidates after deapproval
                  fetch(`${backendUrl}/candidate/admin/pending`, {
                    method: "GET",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${localStorage.getItem(
                        "accessToken"
                      )}`,
                    },
                  })
                    .then((response) => {
                      if (!response.ok)
                        throw new Error("Error refreshing candidates");
                      return response.json();
                    })
                    .then((data) => setCandidates(data.candidates))
                    .catch((err) => console.error(err));
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
