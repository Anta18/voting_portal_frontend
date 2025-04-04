"use client";
import React, { useState, useEffect, JSX } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "../components/AuthGuard";
import { Calendar, Clock, Tag, ChevronRight, Award, Info } from "lucide-react";

interface Election {
  _id: string;
  name: string;
  election_type: string;
  start_date: string;
  end_date: string;
}

interface ElectionsData {
  ongoing: Election[];
  future: Election[];
  past: Election[];
  eligible: Election[];
}

interface Stats {
  total: number;
  participated: number;
  upcoming: number;
}

type TabType = "ongoing" | "future" | "past" | "eligible";

const getDaysRemaining = (dateInput: string | Date): number => {
  const electionDate = new Date(dateInput);
  const today = new Date();
  const diffTime = Math.abs(electionDate.getTime() - today.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export default function DashboardPage() {
  const router = useRouter();
  const [elections, setElections] = useState<ElectionsData>({
    ongoing: [],
    future: [],
    past: [],
    eligible: [],
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<TabType>("ongoing");
  const [stats, setStats] = useState<Stats>({
    total: 0,
    participated: 0,
    upcoming: 0,
  });
  const [flashMessage, setFlashMessage] = useState<string>("");
  const [flashType, setFlashType] = useState<"success" | "error">("success");

  const showFlashMessage = (message: string, type: "success" | "error") => {
    setFlashMessage(message);
    setFlashType(type);
    setTimeout(() => {
      setFlashMessage("");
    }, 3000);
  };

  const handleRegister = async (electionId: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("User not authenticated");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/election/register_for_election`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ election_id: electionId }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }
      showFlashMessage("Registration successful!", "success");
      console.log("Registration successful:", data);

      setElections((prevElections: ElectionsData) => {
        const registeredElection = prevElections.eligible.find(
          (election: Election) => election._id === electionId
        );
        if (!registeredElection) return prevElections;

        const updatedEligible = prevElections.eligible.filter(
          (election: Election) => election._id !== electionId
        );

        const now = new Date();
        const start = new Date(registeredElection.start_date);
        const end = new Date(registeredElection.end_date);

        const updatedOngoing = [...prevElections.ongoing];
        const updatedFuture = [...prevElections.future];
        const updatedPast = [...prevElections.past];

        if (now < start) {
          updatedFuture.push(registeredElection);
        } else if (now > end) {
          updatedPast.push(registeredElection);
        } else {
          updatedOngoing.push(registeredElection);
        }

        return {
          ...prevElections,
          eligible: updatedEligible,
          ongoing: updatedOngoing,
          future: updatedFuture,
          past: updatedPast,
        };
      });
    } catch (err: any) {
      console.error(err);
      showFlashMessage(
        err.message || "Error registering for election",
        "error"
      );
    }
  };

  useEffect(() => {
    const fetchElections = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        const [ongoingRes, futureRes, pastRes, eligibleRes] = await Promise.all(
          [
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/election/user/ongoing`, {
              headers,
            }),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/election/user/future`, {
              headers,
            }),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/election/user/past`, {
              headers,
            }),
            fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/election/eligible_for_registration`,
              { headers }
            ),
          ]
        );

        const [ongoingData, futureData, pastData, eligibleData] =
          await Promise.all([
            ongoingRes.json(),
            futureRes.json(),
            pastRes.json(),
            eligibleRes.json(),
          ]);

        const allElections: ElectionsData = {
          ongoing: ongoingData.ongoing_elections || [],
          future: futureData.future_elections || [],
          past: pastData.past_elections || [],
          eligible: eligibleData.eligible_elections || [],
        };

        setElections(allElections);

        setStats({
          total:
            (ongoingData.ongoing_elections || []).length +
            (futureData.future_elections || []).length +
            (pastData.past_elections || []).length,
          participated: (pastData.past_elections || []).length,
          upcoming:
            (futureData.future_elections || []).length +
            (eligibleData.eligible_elections || []).length,
        });
      } catch (err) {
        console.error("Failed to fetch elections:", err);
      }
      setIsLoading(false);
    };

    fetchElections();
  }, []);

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getProgressPercentage = (
    startDate: string,
    endDate: string
  ): number => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();

    if (now <= start) return 0;
    if (now >= end) return 100;

    const total = end - start;
    const elapsed = now - start;
    return Math.floor((elapsed / total) * 100);
  };

  const getStatusLabel = (election: Election) => {
    const now = new Date();
    const start = new Date(election.start_date);
    const end = new Date(election.end_date);

    if (now < start) {
      return {
        text: `Starts in ${getDaysRemaining(start)} days`,
        color: "text-blue-400",
      };
    } else if (now > end) {
      return {
        text: "Completed",
        color: "text-gray-400",
      };
    } else {
      const daysLeft = getDaysRemaining(end);
      return {
        text: `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`,
        color: "text-green-400",
      };
    }
  };

  const renderElectionCard = (election: Election, type: TabType) => {
    const status = getStatusLabel(election);
    const progress = getProgressPercentage(
      election.start_date,
      election.end_date
    );

    let buttonText = "";
    let onClickAction = () => {};

    if (type === "eligible") {
      buttonText = "Register Now";
      onClickAction = () => handleRegister(election._id);
    } else if (type === "ongoing") {
      buttonText = "Cast Your Vote";
      onClickAction = () => router.push("/elections/vote");
    } else if (type === "past") {
      buttonText = "View Results";
      onClickAction = () => router.push("/elections/results/final");
    } else if (type === "future") {
      buttonText = "Register As A Candidate";
      onClickAction = () => router.push("/candidate/register");
    } else {
      buttonText = "View Details";
      onClickAction = () => {};
    }

    return (
      <div
        key={election._id}
        className="bg-gray-800 rounded-xl overflow-hidden border-l-4 border-yellow-500 shadow-lg transition-all duration-300 hover:shadow-yellow-500/20 hover:scale-105"
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent">
              {election.name}
            </h3>
            <span
              className={`text-sm font-medium px-3 py-1 rounded-full bg-gray-700 ${status.color}`}
            >
              {status.text}
            </span>
          </div>

          <div className="space-y-3 text-gray-300">
            <div className="flex items-center gap-2">
              <Tag size={16} className="text-yellow-400" />
              <span className="capitalize">{election.election_type}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-yellow-400" />
              <span>{formatDate(election.start_date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-yellow-400" />
              <span>{formatDate(election.end_date)}</span>
            </div>
          </div>

          {type === "ongoing" && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-yellow-400 to-red-500 h-2 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
        <div className="bg-gray-700 px-6 py-3 flex justify-between items-center">
          <button
            className="text-gray-300 hover:text-white text-sm font-medium transition-colors flex"
            onClick={onClickAction}
          >
            {buttonText}
            <ChevronRight size={16} className="text-yellow-400 ml-1 mt-[2px]" />
          </button>
        </div>
      </div>
    );
  };

  const renderStatCard = (title: string, value: number, icon: JSX.Element) => (
    <div className="bg-gray-800 rounded-xl p-5 flex items-center gap-4 shadow-lg">
      <div className="bg-gradient-to-br from-yellow-400 to-red-500 p-3 rounded-lg">
        {icon}
      </div>
      <div>
        <p className="text-gray-400 text-sm">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  );

  const getEmptyState = () => (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-10 text-center">
      <div className="flex justify-center mb-4">
        <Info size={48} className="text-gray-600" />
      </div>
      <p className="text-xl text-gray-400">
        No elections found in this category
      </p>
      {activeTab === "eligible" && (
        <p className="mt-2 text-gray-500">
          Check back later for elections you're eligible to register for
        </p>
      )}
    </div>
  );

  return (
    <AuthGuard>
      <div className="h-[calc(100vh-72px)] bg-gradient-to-b from-gray-900 to-black text-white overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600">
              Elections Dashboard
            </h1>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {renderStatCard(
              "Total Registered Elections",
              stats.total,
              <Award size={24} className="text-white" />
            )}
            {renderStatCard(
              "Past Elections",
              stats.participated,
              <Calendar size={24} className="text-white" />
            )}
            {renderStatCard(
              "Upcoming",
              stats.upcoming,
              <Clock size={24} className="text-white" />
            )}
          </div>

          {/* Tabs Navigation */}
          <div className="border-b border-gray-700 mb-6">
            <nav className="flex space-x-8">
              {(["ongoing", "future", "past", "eligible"] as TabType[]).map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ease-in-out ${
                      activeTab === tab
                        ? "border-yellow-500 text-white"
                        : "border-transparent text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    {(tab === "ongoing" && elections.ongoing.length > 0) ||
                    (tab === "eligible" && elections.eligible.length > 0) ? (
                      <span className="ml-2 bg-yellow-500 text-black text-xs font-semibold px-2 py-0.5 rounded-full">
                        {tab === "ongoing"
                          ? elections.ongoing.length
                          : elections.eligible.length}
                      </span>
                    ) : null}
                  </button>
                )
              )}
            </nav>
          </div>

          {/* Content Area */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="mt-8">
              {activeTab === "ongoing" && (
                <>
                  {elections.ongoing.length === 0 ? (
                    getEmptyState()
                  ) : (
                    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                      {elections.ongoing.map((election) =>
                        renderElectionCard(election, "ongoing")
                      )}
                    </div>
                  )}
                </>
              )}

              {activeTab === "future" && (
                <>
                  {elections.future.length === 0 ? (
                    getEmptyState()
                  ) : (
                    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                      {elections.future.map((election) =>
                        renderElectionCard(election, "future")
                      )}
                    </div>
                  )}
                </>
              )}

              {activeTab === "past" && (
                <>
                  {elections.past.length === 0 ? (
                    getEmptyState()
                  ) : (
                    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                      {elections.past.map((election) =>
                        renderElectionCard(election, "past")
                      )}
                    </div>
                  )}
                </>
              )}

              {activeTab === "eligible" && (
                <>
                  {elections.eligible.length === 0 ? (
                    getEmptyState()
                  ) : (
                    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                      {elections.eligible.map((election) =>
                        renderElectionCard(election, "eligible")
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
        {flashMessage && (
          <div className="fixed bottom-4 right-4 bg-gray-800 p-4 rounded shadow-lg border border-gray-700">
            <p
              className={`text-lg ${
                flashType === "error" ? "text-red-500" : "text-green-500"
              }`}
            >
              {flashMessage}
            </p>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
