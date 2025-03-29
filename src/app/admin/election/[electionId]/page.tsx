"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { io } from "socket.io-client";
import {
  Calendar,
  Clock,
  Tag,
  Info,
  ArrowDown,
  ArrowUp,
  User,
  Award,
  PieChart,
} from "lucide-react";

// Types for election and candidate details
interface ElectionDetails {
  id: string;
  name: string;
  election_type: string;
  start_date: string;
  end_date: string;
  required_document: string;
}

interface Candidate {
  id: string;
  election_id: string;
  full_name: string;
  party: string;
  manifesto: string;
  documents?: {
    resume?: string;
  };
  status: string;
  voter_username: string;
  created_at: string;
}

interface DashboardData {
  election: ElectionDetails;
  registrationCount: number;
  voteCount: number;
  candidates: Candidate[];
}

interface ForecastData {
  message: string;
  historical_counts: { [key: string]: number };
  forecast: { date: string; forecast: number }[];
  election_end_date: string;
}

// Modal component to display candidate details
interface CandidateModalProps {
  candidate: Candidate | null;
  onClose: () => void;
}

const CandidateModal: React.FC<CandidateModalProps> = ({
  candidate,
  onClose,
}) => {
  if (!candidate) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative bg-white/10 border border-white/20 rounded-2xl p-8 z-10 max-w-2xl w-full shadow-2xl transform transition-all">
        <button
          onClick={onClose}
          aria-label="Close Modal"
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors rounded-full p-2 hover:bg-white/10"
        >
          ✕
        </button>
        <div className="flex items-center mb-6">
          <div className="bg-yellow-500/20 p-4 rounded-full mr-6">
            <User className="text-yellow-400" size={32} />
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white">
              {candidate.full_name}
            </h3>
            <p className="text-yellow-300">{candidate.party}</p>
          </div>
        </div>
        <div className="space-y-4 bg-white/5 rounded-xl p-6 border border-white/10">
          <div>
            <p className="text-sm text-white/60 mb-2">Manifesto</p>
            <p className="text-white">
              {candidate.manifesto || "No manifesto provided"}
            </p>
          </div>
          {candidate.documents && candidate.documents.resume && (
            <div>
              <p className="text-sm text-white/60 mb-2">Resume</p>
              <a
                href={candidate.documents.resume}
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-400 hover:text-yellow-300 transition-colors underline"
              >
                View Document
              </a>
            </div>
          )}
          <div className="flex items-center text-sm text-white/50">
            <Clock className="mr-2" size={16} />
            Registered on: {new Date(candidate.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ElectionDashboardPage() {
  const { electionId } = useParams();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null
  );
  const [isSortedAsc, setIsSortedAsc] = useState<boolean>(true);
  const [fraudData, setFraudData] = useState<any>(null);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [forecastError, setForecastError] = useState<string>("");

  // Connect to Flask backend via Socket.IO for real-time fraud detection
  useEffect(() => {
    const socket = io(process.env.FLASK_URL || "http://localhost:8000");

    socket.on("connect", () => {
      console.log("Connected to Flask Socket.IO server");
    });

    socket.on("fraud_update", (data) => {
      console.log("Received fraud update:", data);
      setFraudData(data);
    });

    return () => {
      socket.off("fraud_update");
      socket.disconnect();
    };
  }, []);

  // Fetch dashboard data on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/election/admin/dashboard/${electionId}`,
          { headers }
        );
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to fetch dashboard data");
        }
        const data: DashboardData = await res.json();
        setDashboardData(data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      }
      setIsLoading(false);
    };

    if (electionId) {
      fetchDashboardData();
    }
  }, [electionId]);

  // Fetch voter turnout forecast from the Flask backend (HTTP endpoint)
  useEffect(() => {
    const fetchForecastData = async () => {
      try {
        const forecastRes = await fetch(
          `${
            process.env.FLASK_URL || "http://localhost:8000"
          }/forecast-turnout/${electionId}`
        );
        if (!forecastRes.ok) {
          const errorData = await forecastRes.json();
          throw new Error(errorData.error || "Failed to fetch forecast data");
        }
        const forecastJson: ForecastData = await forecastRes.json();
        setForecastData(forecastJson);
      } catch (err: any) {
        setForecastError(err.message || "Error fetching forecast data");
      }
    };

    if (electionId) {
      fetchForecastData();
    }
  }, [electionId]);

  // Format dates
  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Toggle sort order for candidates (by full_name)
  const sortCandidates = () => {
    if (!dashboardData) return;
    const sorted = [...dashboardData.candidates].sort((a, b) =>
      isSortedAsc
        ? a.full_name.localeCompare(b.full_name)
        : b.full_name.localeCompare(a.full_name)
    );
    setDashboardData({ ...dashboardData, candidates: sorted });
    setIsSortedAsc(!isSortedAsc);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#112240] to-[#0A192F] text-white">
      <div className="container mx-auto px-6 py-12">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : dashboardData ? (
          <div>
            {/* Header Section */}
            <header className="mb-12 bg-white/5 rounded-2xl p-8 border border-white/10 shadow-xl">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-5xl font-bold mb-4 text-yellow-400">
                    {dashboardData.election.name}
                  </h1>
                  <p className="text-xl text-white/70">
                    {dashboardData.election.election_type}
                  </p>
                </div>
                <div className="flex space-x-4">
                  <div className="bg-white/10 p-4 rounded-xl border border-white/20">
                    <Calendar className="text-yellow-400" size={24} />
                    <p className="mt-2 text-sm text-white/60">Start Date</p>
                    <p className="font-semibold">
                      {formatDate(dashboardData.election.start_date)}
                    </p>
                  </div>
                  <div className="bg-white/10 p-4 rounded-xl border border-white/20">
                    <Calendar className="text-yellow-400" size={24} />
                    <p className="mt-2 text-sm text-white/60">End Date</p>
                    <p className="font-semibold">
                      {formatDate(dashboardData.election.end_date)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6 text-white/80">
                <span className="font-medium">Required Document:</span>{" "}
                {dashboardData.election.required_document}
              </div>
            </header>

            {/* Stats Section */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {[
                {
                  icon: PieChart,
                  label: "Registrations",
                  value: dashboardData.registrationCount,
                  color: "text-green-400",
                },
                {
                  icon: Award,
                  label: "Votes",
                  value: dashboardData.voteCount,
                  color: "text-blue-400",
                },
                {
                  icon: User,
                  label: "Candidates",
                  value: dashboardData.candidates.length,
                  color: "text-purple-400",
                },
              ].map(({ icon: Icon, label, value, color }) => (
                <div
                  key={label}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center space-x-6 transform hover:scale-105 transition-transform"
                >
                  <div className={`${color} bg-white/10 p-4 rounded-full`}>
                    <Icon size={32} />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">{label}</p>
                    <p className="text-4xl font-bold">{value}</p>
                  </div>
                </div>
              ))}
            </section>

            {/* Candidates Section */}
            <section>
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-3xl font-bold text-yellow-400">
                  Candidates
                </h2>
                <button
                  onClick={sortCandidates}
                  className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition"
                >
                  <span>Sort by Name</span>
                  {isSortedAsc ? (
                    <ArrowDown size={16} />
                  ) : (
                    <ArrowUp size={16} />
                  )}
                </button>
              </div>

              {dashboardData.candidates.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
                  <Info size={64} className="text-white/30 mx-auto mb-6" />
                  <p className="text-2xl text-white/50">No candidates found</p>
                </div>
              ) : (
                <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {dashboardData.candidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl transform hover:scale-105 transition-transform"
                    >
                      <div className="flex items-center mb-4">
                        <div className="bg-yellow-500/20 p-3 rounded-full mr-4">
                          <User className="text-yellow-400" size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">
                            {candidate.full_name}
                          </h3>
                          <p className="text-yellow-300 text-sm">
                            {candidate.party}
                          </p>
                        </div>
                      </div>
                      <div className="text-white/60 mb-4">
                        Registered on:{" "}
                        {new Date(candidate.created_at).toLocaleDateString()}
                      </div>
                      <button
                        onClick={() => setSelectedCandidate(candidate)}
                        className="w-full bg-yellow-500 text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-yellow-400 transition"
                      >
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {selectedCandidate && (
              <CandidateModal
                candidate={selectedCandidate}
                onClose={() => setSelectedCandidate(null)}
              />
            )}

            {/* Voter Turnout Forecast Section */}
            <section className="mt-12 bg-white/5 p-6 border border-white/10 rounded-2xl shadow-xl">
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">
                Voter Turnout Forecast
              </h2>
              {forecastError ? (
                <p className="text-red-500">{forecastError}</p>
              ) : forecastData ? (
                <div>
                  <p className="mb-2">
                    <strong>Election End Date: </strong>
                    {formatDate(forecastData.election_end_date)}
                  </p>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">
                      Historical Registrations:
                    </h3>
                    <ul className="list-disc ml-6">
                      {Object.entries(forecastData.historical_counts).map(
                        ([date, count]) => (
                          <li key={date}>
                            {formatDate(date)}: {count}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Forecast:</h3>
                    <ul className="list-disc ml-6">
                      {forecastData.forecast.map((item) => (
                        <li key={item.date}>
                          {formatDate(item.date)}: {item.forecast}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center items-center">
                  <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </section>

            {/* Fraud Data Section (Real-Time Updates) */}
            {fraudData && (
              <section className="mt-12 bg-white/5 p-6 border border-white/10 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-bold text-yellow-400 mb-4">
                  Real-Time Fraud Detection
                </h2>
                <pre className="text-white text-sm">
                  {JSON.stringify(fraudData, null, 2)}
                </pre>
              </section>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
