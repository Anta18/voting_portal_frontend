"use client";
import { useState, useEffect } from "react";
import { AuthGuard } from "@/app/components/AuthGuard";

interface Election {
  _id: string;
  name: string;
  election_type?: string;
  start_date?: string;
  end_date?: string;
}

export default function ElectionsPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [elections, setElections] = useState<Election[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [flashMessage, setFlashMessage] = useState<string>("");
  const [flashType, setFlashType] = useState<"success" | "error">("success");

  // Fetch eligible elections from backend (/election/eligible_for_registration)
  useEffect(() => {
    async function fetchEligibleElections() {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) throw new Error("User not authenticated");
        const res = await fetch(
          `${API_URL}/election/eligible_for_registration`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to fetch elections");
        }
        const data = await res.json();
        setElections(data.eligible_elections || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Error fetching elections");
      } finally {
        setLoading(false);
      }
    }
    fetchEligibleElections();
  }, [API_URL]);

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
      const res = await fetch(`${API_URL}/election/register_for_election`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ election_id: electionId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }
      showFlashMessage("Registration successful!", "success");
      console.log("Registration successful:", data);
      // Remove the registered election from the list immediately.
      setElections((prevElections) =>
        prevElections.filter((election) => election._id !== electionId)
      );
    } catch (err: any) {
      console.error(err);
      showFlashMessage(
        err.message || "Error registering for election",
        "error"
      );
    }
  };

  return (
    <AuthGuard>
      <div className="relative min-h-[calc(100vh-72px)] bg-gray-900 text-white p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-extrabold mb-24 mt-12 text-center bg-gradient-to-r from-yellow-400 to-red-600 bg-clip-text text-transparent">
            Elections
          </h1>
          {loading ? (
            <div className="bg-gray-800 rounded-lg p-10 text-center shadow-2xl">
              <p className="text-2xl">Loading eligible elections...</p>
            </div>
          ) : error ? (
            <div className="bg-gray-800 rounded-lg p-10 text-center shadow-2xl">
              <p className="text-2xl text-red-500">{error}</p>
            </div>
          ) : elections.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-10 text-center shadow-2xl">
              <p className="text-2xl">No eligible elections</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
              {elections.map((election) => (
                <div
                  key={election._id}
                  className="bg-gray-800 rounded-xl shadow-lg overflow-hidden border-l-8 border-transparent transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-l-8 hover:border-gradient-to-br hover:from-yellow-400 hover:to-red-600"
                >
                  <div className="p-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-red-600 bg-clip-text text-transparent">
                        {election.name}
                      </h2>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Type:</span>
                        <span className="capitalize">
                          {election.election_type}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Starts:</span>
                        <span>
                          {election.start_date
                            ? new Date(election.start_date).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Ends:</span>
                        <span>
                          {election.end_date
                            ? new Date(election.end_date).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-700 px-6 py-4 flex justify-center">
                    <button
                      onClick={() => handleRegister(election._id)}
                      className="bg-gradient-to-r from-yellow-400 to-red-600 hover:from-red-600 hover:to-yellow-400 text-white px-6 py-2 rounded-md font-medium transition-colors duration-300"
                    >
                      Register
                    </button>
                  </div>
                </div>
              ))}
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
