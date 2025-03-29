"use client";
import { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import { io, Socket } from "socket.io-client";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { AuthGuard } from "@/app/components/AuthGuard";
import {
  ArrowLeftRight,
  ChevronDown,
  ChevronUp,
  BarChart3,
  RefreshCw,
  Award,
} from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend);

interface Election {
  _id: string;
  name: string;
  election_type?: string;
  start_date?: string;
  end_date?: string;
}

interface CandidateResult {
  candidate_id: string;
  candidate_name: string;
  party: string;
  vote_count: string;
}

interface LiveResultsPayload {
  election_id: string;
  live_results: CandidateResult[];
}

export default function LiveResultsPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Sidebar elections fetched from backend (/election/admin/ongoing)
  const [sidebarElections, setSidebarElections] = useState<Election[]>([]);
  const [sidebarError, setSidebarError] = useState<string>("");
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // Live results received via SocketIO
  const [liveResults, setLiveResults] = useState<LiveResultsPayload | null>(
    null
  );
  const [resultsError, setResultsError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Currently selected election ID from sidebar
  const [selectedElection, setSelectedElection] = useState<string>("");
  // Toggle for showing all results vs. top 5
  const [showAll, setShowAll] = useState(false);

  // State to force a re-render (e.g. for chart updates)
  const [updateCounter, setUpdateCounter] = useState(0);

  // Socket instance
  const [socket, setSocket] = useState<Socket | null>(null);

  // Fetch sidebar elections from backend
  useEffect(() => {
    async function fetchSidebarElections() {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API_URL}/election/admin/ongoing`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error("Failed to fetch ongoing elections");
        }
        const data = await res.json();
        setSidebarElections(data.ongoing_elections || []);
      } catch (err: any) {
        console.error(err);
        setSidebarError(err.message || "Error fetching elections");
      }
    }
    fetchSidebarElections();
  }, [API_URL]);

  // Manage socket connection based on selected election
  useEffect(() => {
    if (!selectedElection) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setResultsError("User not authenticated");
      setLoading(false);
      return;
    }

    // Establish socket connection
    const newSocket = io(API_URL, {
      transports: ["websocket"],
      auth: { token },
    });
    setSocket(newSocket);
    setLoading(true);

    // Listen for complete live results event
    newSocket.on("live_results_admin", (data: LiveResultsPayload) => {
      console.log("Received live results:", data);
      if (data.election_id === selectedElection) {
        // Create new object and array references and force re-render
        setLiveResults({ ...data, live_results: [...data.live_results] });
        setUpdateCounter((prev) => prev + 1);
      }
      setLoading(false);
      setRefreshing(false);
    });

    // Process incremental vote updates
    newSocket.on("vote_update", (data: any) => {
      console.log("Received vote update:", data);
      if (data.election_id === selectedElection) {
        // Update candidate vote counts based on the tally payload.
        // Assumes data.tally has two arrays:
        //    candidates: [candidate_id, ...] and counts: [vote_count, ...]
        setLiveResults((prev) => {
          if (!prev) return prev;
          const updatedCandidates = prev.live_results.map((candidate) => {
            const candidateIndex = data.tally.candidates.indexOf(
              candidate.candidate_id
            );
            if (candidateIndex !== -1) {
              return {
                ...candidate,
                vote_count: data.tally.counts[candidateIndex],
              };
            }
            return candidate;
          });
          return { ...prev, live_results: updatedCandidates };
        });
        setUpdateCounter((prev) => prev + 1);
      }
    });

    newSocket.on("error", (data: any) => {
      console.error("Socket error:", data);
      setResultsError(data.error || "Socket error");
      setLoading(false);
      setRefreshing(false);
    });

    // Emit subscription event for the selected election
    newSocket.emit("subscribe_live_results_admin", {
      token,
      election_id: selectedElection,
    });
    console.log("Subscribed: ", selectedElection);

    // Cleanup: disconnect socket on unmount or election change
    return () => {
      newSocket.disconnect();
    };
  }, [selectedElection, API_URL]);

  // Handle election selection
  const handleElectionSelect = (electionId: string) => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    setSelectedElection(electionId);
    setLiveResults(null);
    setShowAll(false);
    // On mobile, hide sidebar after selection
    if (window.innerWidth < 768) {
      setSidebarVisible(false);
    }
  };

  const handleRefresh = () => {
    if (!socket || !selectedElection) return;

    setRefreshing(true);
    const token = localStorage.getItem("accessToken");
    socket.emit("subscribe_live_results_admin", {
      token,
      election_id: selectedElection,
    });

    // Safety timeout to reset refreshing state if no response
    setTimeout(() => {
      setRefreshing(false);
    }, 5000);
  };

  // Get the live results for the selected election
  let candidateResults: CandidateResult[] | null = null;
  if (liveResults && liveResults.election_id === selectedElection) {
    candidateResults = liveResults.live_results;
  }

  // Sort results descending by vote_count
  let sortedResults: CandidateResult[] = [];
  if (candidateResults) {
    sortedResults = [...candidateResults].sort(
      (a, b) => Number(b.vote_count) - Number(a.vote_count)
    );
  }

  // Compute total votes for percentage calculations
  const totalVotes = sortedResults.reduce(
    (sum, candidate) => sum + Number(candidate.vote_count),
    0
  );

  // Get current leader
  const leader = sortedResults.length > 0 ? sortedResults[0] : null;

  // List display: default to top 5 unless "View All" is toggled
  const displayResults = showAll ? sortedResults : sortedResults.slice(0, 5);

  // Prepare pie chart data: top 4 candidates with remaining as 'Others'
  let pieData = null;
  if (sortedResults.length > 0) {
    const topFour = sortedResults.slice(0, 4);
    const others = sortedResults.slice(4);
    const othersTotal = others.reduce(
      (sum, candidate) => sum + Number(candidate.vote_count),
      0
    );
    const labels = topFour.map((candidate) => candidate.candidate_name);
    const dataValues = topFour.map((candidate) => Number(candidate.vote_count));
    if (othersTotal > 0) {
      labels.push("Others");
      dataValues.push(othersTotal);
    }
    pieData = {
      labels,
      datasets: [
        {
          data: dataValues,
          backgroundColor: [
            "rgba(255, 99, 132, 0.8)",
            "rgba(54, 162, 235, 0.8)",
            "rgba(255, 206, 86, 0.8)",
            "rgba(75, 192, 192, 0.8)",
            "rgba(153, 102, 255, 0.8)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
          ],
          borderWidth: 2,
        },
      ],
    };
  }

  // Pie chart options to display count and percentage on hover
  const pieOptions = {
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          font: {
            size: 13,
            weight: "bold" as const,
          },
          color: "#E5E7EB",
          padding: 15,
        },
      },
      tooltip: {
        titleFont: {
          size: 14,
          weight: "bold" as const,
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: (context: any) => {
            const label = context.label || "";
            const value = context.parsed;
            const total = context.chart.data.datasets[0].data.reduce(
              (sum: number, val: number) => sum + val,
              0
            );
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value.toLocaleString()} votes (${percentage}%)`;
          },
        },
      },
    },
    animation: {
      duration: 1000,
    },
    responsive: true,
    maintainAspectRatio: true,
  };

  // Find selected election details
  const selectedElectionDetails = sidebarElections.find(
    (election) => election._id === selectedElection
  );

  // Format the time component
  const formatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const [currentTime, setCurrentTime] = useState(formatTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(formatTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Mobile sidebar toggle
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <div className="h-[calc(100vh-72px)] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-100">
      {/* Mobile header with toggle button */}
      <div className="md:hidden flex items-center justify-between p-3 bg-slate-800 border-b border-slate-700">
        <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-rose-500 bg-clip-text text-transparent">
          Live Election Results
        </h1>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
        >
          <ArrowLeftRight size={20} className="text-gray-200" />
        </button>
      </div>

      <div className="h-full flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarVisible ? "flex" : "hidden"
          } md:flex flex-col md:w-1/4 lg:w-1/5 h-full border-r border-slate-700 bg-gradient-to-b from-slate-900 to-slate-800 overflow-hidden transition-all duration-300`}
        >
          <div className="hidden md:flex items-center justify-between p-4 border-b border-slate-700">
            <h2 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-rose-500 bg-clip-text text-transparent">
              Elections
            </h2>
            <BarChart3 size={22} className="text-amber-400" />
          </div>
          <div className="flex-grow overflow-y-auto p-3">
            {sidebarError ? (
              <div className="p-4 my-2 bg-red-900/40 border border-red-700 rounded-lg">
                <p className="text-center text-red-300">{sidebarError}</p>
              </div>
            ) : sidebarElections.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-gray-400 text-center">
                  No ongoing elections found
                </p>
              </div>
            ) : (
              <ul className="space-y-2 mt-1">
                {sidebarElections.map((election) => (
                  <li key={election._id}>
                    <button
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 ${
                        selectedElection === election._id
                          ? "bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-lg shadow-amber-900/30 font-medium"
                          : "bg-slate-800/80 hover:bg-slate-700 text-gray-200"
                      }`}
                      onClick={() => handleElectionSelect(election._id)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="line-clamp-1">{election.name}</span>
                        {selectedElection === election._id && (
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                          </span>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="p-3 border-t border-slate-700 bg-slate-800/50 text-xs text-gray-400">
            Last updated: {currentTime}
          </div>
        </aside>

        {/* Main Content */}
        <main
          className={`flex-grow h-full overflow-hidden flex flex-col ${
            sidebarVisible ? "hidden md:flex" : "flex"
          }`}
        >
          {!selectedElection ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center mb-6">
                <BarChart3 size={40} className="text-amber-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-300 mb-3">
                No Election Selected
              </h2>
              <p className="text-gray-400 max-w-md">
                Please select an election from the sidebar to view live results
                and analytics.
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="p-4 border-b border-slate-700 bg-slate-800/40">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold">
                      {selectedElectionDetails?.name || "Election Results"}
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">
                      {`Live results • ${totalVotes.toLocaleString()} total votes • Updated at ${currentTime}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleRefresh}
                      disabled={refreshing}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                        refreshing
                          ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                          : "bg-slate-700 hover:bg-slate-600 text-white"
                      } transition-colors`}
                    >
                      <RefreshCw
                        size={16}
                        className={refreshing ? "animate-spin" : ""}
                      />
                      <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-grow overflow-y-auto">
                {loading && !liveResults ? (
                  <div className="flex flex-col items-center justify-center h-full p-6">
                    <div className="w-16 h-16 border-4 border-t-amber-500 border-slate-700 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-300">Loading live results...</p>
                  </div>
                ) : resultsError ? (
                  <div className="p-6 m-4 bg-red-900/30 border border-red-700 rounded-lg text-center">
                    <p className="text-red-300">{resultsError}</p>
                  </div>
                ) : candidateResults && candidateResults.length > 0 ? (
                  totalVotes === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                      <p className="text-gray-400">No Votes Polled Yet</p>
                    </div>
                  ) : (
                    <div className="p-4 lg:p-6">
                      {/* Leader card */}
                      {leader && (
                        <div className="mb-6 p-4 lg:p-6 bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/30 rounded-xl shadow-xl">
                          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="p-4 rounded-full bg-amber-500/20 border border-amber-500/40">
                                <Award size={28} className="text-amber-400" />
                              </div>
                              <div>
                                <p className="text-gray-400 font-medium">
                                  Current Leader
                                </p>
                                <h3 className="text-xl md:text-2xl font-bold text-white">
                                  {leader.candidate_name}
                                </h3>
                                <p className="text-sm text-gray-300">
                                  {leader.party}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-400 to-rose-500 bg-clip-text text-transparent">
                                {(
                                  (Number(leader.vote_count) / totalVotes) *
                                  100
                                ).toFixed(1)}
                                %
                              </p>
                              <p className="text-gray-300">
                                {Number(leader.vote_count).toLocaleString()}{" "}
                                votes
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid lg:grid-cols-2 gap-6">
                        {/* Results List */}
                        <div className="bg-slate-800/60 rounded-xl shadow-lg border border-slate-700 overflow-hidden">
                          <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                            <h3 className="font-bold text-lg">
                              Candidate Results
                            </h3>
                            {sortedResults.length > 5 && (
                              <button
                                onClick={() => setShowAll(!showAll)}
                                className="flex items-center gap-1 text-sm text-amber-400 hover:text-amber-300 transition-colors"
                              >
                                {showAll ? (
                                  <>
                                    <span>Show Top 5</span>
                                    <ChevronUp size={16} />
                                  </>
                                ) : (
                                  <>
                                    <span>
                                      View All ({sortedResults.length})
                                    </span>
                                    <ChevronDown size={16} />
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                          <div className="overflow-y-auto max-h-96">
                            <div className="divide-y divide-slate-700">
                              {displayResults.map((result, index) => {
                                const {
                                  candidate_id,
                                  candidate_name,
                                  party,
                                  vote_count,
                                } = result;
                                const percentage = totalVotes
                                  ? (
                                      (Number(vote_count) / totalVotes) *
                                      100
                                    ).toFixed(1)
                                  : "0.0";
                                const percentWidth = totalVotes
                                  ? (Number(vote_count) / totalVotes) * 100
                                  : 0;
                                const getColor = (position: number) => {
                                  if (position === 0)
                                    return "from-amber-500 to-rose-500";
                                  if (position === 1)
                                    return "from-blue-500 to-indigo-500";
                                  if (position === 2)
                                    return "from-emerald-500 to-teal-500";
                                  return "from-slate-500 to-slate-600";
                                };

                                return (
                                  <div
                                    key={candidate_id}
                                    className="p-4 relative overflow-hidden hover:bg-slate-700/30 transition-colors"
                                  >
                                    <div
                                      className={`absolute left-0 top-0 h-full bg-gradient-to-r ${getColor(
                                        index
                                      )} opacity-20`}
                                      style={{ width: `${percentWidth}%` }}
                                    ></div>
                                    <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                      <div>
                                        <div className="font-bold text-white">
                                          {candidate_name}
                                        </div>
                                        <div className="text-sm text-gray-400">
                                          {party}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <div className="text-right">
                                          <div className="font-bold text-white">
                                            {percentage}%
                                          </div>
                                          <div className="text-sm text-gray-400">
                                            {Number(
                                              vote_count
                                            ).toLocaleString()}{" "}
                                            votes
                                          </div>
                                        </div>
                                        {index === 0 && (
                                          <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                                            <Award
                                              size={14}
                                              className="text-amber-400"
                                            />
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Pie Chart */}
                        <div className="bg-slate-800/60 rounded-xl shadow-lg border border-slate-700 p-4 flex flex-col">
                          <h3 className="font-bold text-lg mb-2 px-2">
                            Vote Distribution
                          </h3>
                          <div className="flex-grow flex items-center justify-center p-4">
                            {pieData ? (
                              <div className="w-full max-w-md">
                                <Pie
                                  key={updateCounter}
                                  data={pieData}
                                  options={pieOptions}
                                />
                              </div>
                            ) : (
                              <p className="text-gray-400">
                                No data available for visualization
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                    <p className="text-gray-400">
                      No results available for this election yet.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
