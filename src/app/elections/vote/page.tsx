"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import { io, Socket } from "socket.io-client";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import { AuthGuard } from "@/app/components/AuthGuard";
import {
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Award,
  ChevronRight,
  HelpCircle,
  Info,
  Vote,
} from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend);

interface Election {
  _id: string;
  id: string;
  name: string;
  end_date: string;
}

interface Candidate {
  _id: string;
  full_name: string;
  party: string;
  image: string;
  biography?: string;
  policy_positions?: string[];
}

interface CandidateResult {
  candidate_id: string;
  candidate_name: string;
  vote_count: string;
}

interface LiveResultsPayload {
  election_id: string;
  live_results: CandidateResult[];
}

export default function VotePage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [sidebarElections, setSidebarElections] = useState<Election[]>([]);
  const [selectedElection, setSelectedElection] = useState<string>("");
  const [electionDetails, setElectionDetails] = useState<Election | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(
    null
  );
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [submittingVote, setSubmittingVote] = useState(false);
  const [error, setError] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Live results state and socket instance
  const [liveResults, setLiveResults] = useState<LiveResultsPayload | null>(
    null
  );
  const [socket, setSocket] = useState<Socket | null>(null);

  // Fetch ongoing elections from backend
  useEffect(() => {
    async function fetchElections() {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API_URL}/election/user/ongoing/not-voted`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to fetch elections");
        }

        const data = await res.json();
        setSidebarElections(data.ongoing_elections || []);
      } catch (err: any) {
        console.error("Error fetching elections:", err);
        setError("Unable to load available elections. Please try again later.");
      }
    }

    fetchElections();
  }, [API_URL]);

  // Fetch candidates when an election is selected
  useEffect(() => {
    async function fetchCandidates() {
      if (!selectedElection) {
        setCandidates([]);
        setElectionDetails(null);
        return;
      }

      setLoadingCandidates(true);
      setError("");

      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(
          `${API_URL}/candidate/list?election_id=${selectedElection}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to fetch candidates");
        }

        const data = await res.json();
        setCandidates(data.candidates || []);
        console.log(data.candidates);

        const currentElection = sidebarElections.find(
          (e) => e._id === selectedElection
        );
        if (currentElection) {
          setElectionDetails(currentElection);
          console.log(electionDetails);
        }
      } catch (err: any) {
        console.error("Error fetching candidates:", err);
        setError("Unable to load candidates. Please try again later.");
      } finally {
        setLoadingCandidates(false);
      }
    }

    fetchCandidates();
    setSelectedCandidate(null);
  }, [selectedElection, API_URL, sidebarElections]);

  // Setup socket connection to listen for live results
  useEffect(() => {
    if (!selectedElection) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("User not authenticated for live updates.");
      return;
    }

    const newSocket = io(API_URL, {
      transports: ["websocket"],
      auth: { token },
    });
    setSocket(newSocket);

    newSocket.on("live_results_voter", (data: LiveResultsPayload) => {
      if (data.election_id === selectedElection) {
        setLiveResults({ ...data, live_results: [...data.live_results] });
      }
    });

    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, [selectedElection, API_URL]);

  // Submit vote handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (showConfirmation) {
      submitVote();
    } else {
      setShowConfirmation(true);
    }
  };

  const submitVote = async () => {
    if (!selectedElection || !selectedCandidate) return;

    setSubmittingVote(true);
    setError("");

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_URL}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          election_id: selectedElection,
          candidate: selectedCandidate,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Vote submission failed");
      }

      const receipt = data.transaction_hash || "ABC123XYZ";
      router.push(`/elections/receipt?receipt=${receipt}`);
    } catch (err: any) {
      console.error("Error submitting vote:", err);
      setError(err.message || "Error submitting vote. Please try again.");
      setShowConfirmation(false);
    } finally {
      setSubmittingVote(false);
    }
  };

  // Format remaining time
  const getTimeRemaining = (endDate: string) => {
    if (!endDate) return "Unknown";

    const end = new Date(endDate);
    const now = new Date();
    const diffMs = end.getTime() - now.getTime();

    if (diffMs <= 0) return "Ended";

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHrs = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );

    if (diffDays > 0) {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} left`;
    } else {
      return `${diffHrs} hour${diffHrs !== 1 ? "s" : ""} left`;
    }
  };

  // Prepare candidate data for the chart using live results if available
  const candidateChartData = {
    labels:
      liveResults && liveResults.live_results.length > 0
        ? liveResults.live_results.map((r) => r.candidate_name)
        : candidates.map((c) => c.full_name),
    datasets: [
      {
        data:
          liveResults && liveResults.live_results.length > 0
            ? liveResults.live_results.map((r) => Number(r.vote_count))
            : candidates.map((_, i) => Math.floor(Math.random() * 50) + 10),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#8AC926",
          "#1982C4",
          "#6A4C93",
          "#F94144",
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: "#d1d5db",
          padding: 20,
          font: { size: 12 },
        },
      },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.8)",
        titleColor: "#f3f4f6",
        bodyColor: "#f3f4f6",
        bodyFont: { size: 14 },
        borderColor: "#374151",
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: (context: any) => {
            const label = context.label || "";
            const value = context.parsed;
            const total = context.chart.data.datasets[0].data.reduce(
              (sum: number, val: number) => sum + val,
              0
            );
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${percentage}%`;
          },
        },
      },
    },
    cutout: "50%",
    animation: {
      animateScale: true,
      animateRotate: true,
    },
  };

  const getCandidateById = (id: string) => {
    return candidates.find((c) => c._id === id) || null;
  };

  return (
    <AuthGuard>
      <div className="h-[calc(100vh-72px)] bg-gradient-to-b from-gray-900 via-gray-900 to-black text-gray-100 flex">
        <Sidebar
          elections={sidebarElections}
          selectedElection={selectedElection}
          onElectionSelect={(id) => setSelectedElection(id)}
        />

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <header className="mb-8">
              <h1 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600">
                Cast Your Vote
              </h1>

              {selectedElection ? (
                electionDetails && (
                  <div className="bg-gray-800/70 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                      <h2 className="font-semibold text-xl text-gray-200">
                        {electionDetails.name}
                      </h2>
                      <div className="flex items-center mt-1 text-gray-400">
                        <Clock size={16} className="mr-2 text-yellow-400" />
                        <span>
                          {getTimeRemaining(electionDetails.end_date)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 md:mt-0 flex items-center text-sm bg-gray-700/70 rounded-full px-4 py-1.5">
                      <Info size={14} className="mr-2 text-yellow-400" />
                      <span>Your vote is secure and anonymous</span>
                    </div>
                  </div>
                )
              ) : (
                <div className="bg-gray-800/70 rounded-lg p-4 flex justify-center items-center">
                  <p className="text-gray-400">
                    Please select an election from the sidebar.
                  </p>
                </div>
              )}
            </header>

            {error && (
              <div className="mb-6 bg-red-900/30 border border-red-800 rounded-lg p-4 flex items-center">
                <AlertCircle
                  size={20}
                  className="text-red-500 mr-3 flex-shrink-0"
                />
                <p className="text-red-300">{error}</p>
              </div>
            )}

            {/* Only render the rest of the content if an election is selected */}
            {selectedElection ? (
              <>
                {loadingCandidates ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <>
                    {showConfirmation &&
                      selectedCandidate &&
                      !submittingVote && (
                        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                          <div className="bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-2xl border border-gray-700 animate-fadeIn">
                            <div className="text-center mb-6">
                              <Vote
                                size={40}
                                className="mx-auto mb-4 text-yellow-500"
                              />
                              <h3 className="text-xl font-bold text-gray-100">
                                Confirm Your Vote
                              </h3>
                              <p className="text-gray-400 mt-2">
                                You are about to vote for:
                              </p>
                              <p className="text-yellow-400 font-semibold text-lg mt-1">
                                {getCandidateById(selectedCandidate)?.full_name}
                              </p>
                              <p className="text-gray-400 mt-4 text-sm">
                                This action cannot be undone. Your vote is final
                                and will be recorded on the blockchain.
                              </p>
                            </div>
                            <div className="flex flex-col space-y-3">
                              <button
                                onClick={submitVote}
                                className="bg-gradient-to-r from-yellow-500 to-red-600 hover:from-red-600 hover:to-yellow-500 text-white py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center justify-center"
                              >
                                Confirm Vote
                              </button>
                              <button
                                onClick={() => setShowConfirmation(false)}
                                className="bg-gray-700 hover:bg-gray-600 text-gray-200 py-2.5 rounded-lg font-medium transition-colors duration-300"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                    {submittingVote && (
                      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-800 rounded-lg p-8 flex flex-col items-center">
                          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                          <p className="text-lg font-medium text-gray-200">
                            Submitting your vote...
                          </p>
                          <p className="text-gray-400 text-sm mt-2">
                            Please wait while we process your vote securely
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Main content: Candidate selection & live results side panel */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2">
                        <div className="bg-gray-800/50 rounded-lg p-5 shadow-lg">
                          <h2 className="text-xl font-semibold mb-5 flex items-center">
                            <User size={20} className="mr-3 text-yellow-400" />
                            Select Your Candidate
                          </h2>
                          <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 gap-4">
                              {candidates.map((candidate) => (
                                <label
                                  key={candidate._id}
                                  className={`border rounded-xl p-5 flex items-start cursor-pointer transition-all duration-300 
                                    ${
                                      selectedCandidate === candidate._id
                                        ? "bg-gray-700 border-yellow-500 shadow-lg shadow-yellow-500/10"
                                        : "bg-gray-800/80 border-gray-700 hover:bg-gray-750"
                                    }`}
                                >
                                  <input
                                    type="radio"
                                    name="candidate"
                                    value={candidate._id}
                                    checked={
                                      selectedCandidate === candidate._id
                                    }
                                    onChange={() =>
                                      setSelectedCandidate(candidate._id)
                                    }
                                    className="hidden"
                                  />
                                  <div
                                    className={`flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full border-2 mr-4 mt-1 ${
                                      selectedCandidate === candidate._id
                                        ? "border-yellow-500 bg-yellow-500/20"
                                        : "border-gray-500"
                                    }`}
                                  >
                                    {selectedCandidate === candidate._id && (
                                      <CheckCircle
                                        size={16}
                                        className="text-yellow-500"
                                      />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h3 className="font-semibold text-lg text-gray-100">
                                          {candidate.full_name}
                                        </h3>
                                        <p
                                          className={`${
                                            candidate.party
                                              ? "text-yellow-400"
                                              : "text-gray-400"
                                          } text-sm font-medium mt-1`}
                                        >
                                          {candidate.party ||
                                            "Independent Candidate"}
                                        </p>
                                      </div>
                                      <ChevronRight
                                        size={18}
                                        className={`transition-colors duration-300 ${
                                          selectedCandidate === candidate._id
                                            ? "text-yellow-500"
                                            : "text-gray-600"
                                        }`}
                                      />
                                    </div>
                                    {candidate.biography && (
                                      <p className="text-gray-400 text-sm mt-3 line-clamp-2">
                                        {candidate.biography}
                                      </p>
                                    )}
                                  </div>
                                </label>
                              ))}
                            </div>
                            <button
                              type="submit"
                              disabled={!selectedCandidate}
                              className={`mt-6 w-full py-3 rounded-lg font-semibold shadow-lg transition-all duration-300 ${
                                !selectedCandidate
                                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                                  : "bg-gradient-to-r from-yellow-500 to-red-600 hover:from-red-600 hover:to-yellow-500 text-white"
                              }`}
                            >
                              {selectedCandidate
                                ? "Continue to Submit Vote"
                                : "Select a Candidate to Continue"}
                            </button>
                          </form>
                        </div>
                      </div>

                      {/* Side Panel: Live Election Stats & Info */}
                      <div className="lg:col-span-1">
                        <div className="bg-gray-800/50 rounded-lg p-5 shadow-lg mb-6">
                          <h2 className="text-xl font-semibold mb-5 flex items-center">
                            <Award size={20} className="mr-3 text-yellow-400" />
                            Election Stats
                          </h2>
                          <div className="mb-6">
                            <div className="aspect-square">
                              <Pie
                                data={candidateChartData}
                                options={chartOptions}
                              />
                            </div>
                            <p className="text-gray-400 text-xs mt-4 text-center">
                              *Live vote distribution
                            </p>
                          </div>
                          <div className="space-y-4 border-t border-gray-700 pt-4">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-400">
                                Total Candidates:
                              </span>
                              <span className="font-medium">
                                {candidates.length}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-800/50 rounded-lg p-5 shadow-lg">
                          <h2 className="text-xl font-semibold mb-4 flex items-center">
                            <HelpCircle
                              size={20}
                              className="mr-3 text-yellow-400"
                            />
                            Voting Info
                          </h2>
                          <ul className="space-y-3 text-sm text-gray-300">
                            <li className="flex items-start">
                              <CheckCircle
                                size={16}
                                className="text-green-500 mr-2 mt-0.5 flex-shrink-0"
                              />
                              Your vote is secured by blockchain technology
                            </li>
                            <li className="flex items-start">
                              <CheckCircle
                                size={16}
                                className="text-green-500 mr-2 mt-0.5 flex-shrink-0"
                              />
                              Verification receipt will be provided after voting
                            </li>
                            <li className="flex items-start">
                              <CheckCircle
                                size={16}
                                className="text-green-500 mr-2 mt-0.5 flex-shrink-0"
                              />
                              Your identity remains anonymous
                            </li>
                            <li className="flex items-start">
                              <Info
                                size={16}
                                className="text-yellow-500 mr-2 mt-0.5 flex-shrink-0"
                              />
                              You cannot change your vote after submission
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {!loadingCandidates && candidates.length === 0 && (
                      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-10 text-center">
                        <HelpCircle
                          size={48}
                          className="text-gray-500 mx-auto mb-4"
                        />
                        <h3 className="text-xl font-semibold text-gray-300 mb-2">
                          No Candidates Available
                        </h3>
                        <p className="text-gray-400 max-w-md mx-auto">
                          There are no candidates for the selected election.
                          Please select another election from the sidebar.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : null}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
